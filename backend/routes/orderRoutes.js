import express from "express";
import mongoose from "mongoose";
import { verifyAccessToken } from "../middleware/auth.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendAdminPaymentSuccessEmail, sendOrderEmail } from "../services/mailService.js";
import {
  createStripePaymentIntent,
  fetchStripePaymentIntent,
  getStripePublicConfig,
} from "../services/paymentService.js";
import {
  convertAmountForRegion,
  getCurrencyConfig,
  getDisplayCurrency,
  getPaymentCurrency,
  inferRegionFromCountry,
  normalizeRegion,
} from "../utils/currency.js";
import { normalizePaymentMethod } from "../utils/paymentMethod.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const amountFromMinorUnit = (amountInMinorUnit, currency) => {
  const upperCurrency = String(currency || "").toUpperCase();
  const divisor = upperCurrency === "KWD" ? 1000 : 100;
  const decimalPlaces = upperCurrency === "KWD" ? 3 : 2;
  return Number(((Number(amountInMinorUnit) || 0) / divisor).toFixed(decimalPlaces));
};

const isFailedPaymentIntent = (paymentIntent) =>
  paymentIntent?.status === "canceled" ||
  paymentIntent?.status === "requires_payment_method" ||
  Boolean(paymentIntent?.last_payment_error);

const findOrderByPaymentIntentForUser = async (paymentIntentId, userId) => {
  const order = await Order.findOne({
    stripePaymentIntentId: paymentIntentId,
    userId,
  });

  if (order) {
    return order;
  }

  const paymentIntent = await fetchStripePaymentIntent(paymentIntentId);
  const metadataOrderId = paymentIntent?.metadata?.orderId;

  if (!metadataOrderId) {
    return null;
  }

  return Order.findOne({
    _id: metadataOrderId,
    userId,
  });
};

const finalizeSuccessfulStripePayment = async (order, paymentIntent, userEmail) => {
  const displayCurrency = String(
    paymentIntent?.metadata?.display_currency || order.displayCurrency || getDisplayCurrency(order.region)
  ).toUpperCase();
  const paymentCurrency = String(
    paymentIntent?.currency || paymentIntent?.metadata?.payment_currency || order.paymentCurrency || getPaymentCurrency(order.region)
  ).toUpperCase();
  const displayAmount =
    paymentIntent?.metadata?.display_amount !== undefined
      ? Number(paymentIntent.metadata.display_amount)
      : Number(order.totalPrice || order.amount || 0);
  const paymentAmount =
    paymentIntent?.metadata?.payment_amount
      ? Number(paymentIntent.metadata.payment_amount)
      : amountFromMinorUnit(paymentIntent?.amount_received || paymentIntent?.amount, paymentCurrency);

  order.region = normalizeRegion(paymentIntent?.metadata?.region || order.region);
  order.currency = displayCurrency;
  order.displayCurrency = displayCurrency;
  order.paymentCurrency = paymentCurrency;
  order.paymentAmount = paymentAmount;
  order.amount = displayAmount;
  order.original_amount_kwd =
    paymentIntent?.metadata?.original_amount_kwd !== undefined &&
    paymentIntent?.metadata?.original_amount_kwd !== ""
      ? Number(paymentIntent.metadata.original_amount_kwd)
      : order.original_amount_kwd;
  order.converted_amount_usd =
    paymentIntent?.metadata?.converted_amount_usd !== undefined &&
    paymentIntent?.metadata?.converted_amount_usd !== ""
      ? Number(paymentIntent.metadata.converted_amount_usd)
      : order.converted_amount_usd;
  order.exchange_rate_used =
    paymentIntent?.metadata?.exchange_rate_used !== undefined &&
    paymentIntent?.metadata?.exchange_rate_used !== ""
      ? Number(paymentIntent.metadata.exchange_rate_used)
      : order.exchange_rate_used;
  order.exchange_buffer_percent =
    paymentIntent?.metadata?.exchange_buffer_percent !== undefined &&
    paymentIntent?.metadata?.exchange_buffer_percent !== ""
      ? Number(paymentIntent.metadata.exchange_buffer_percent)
      : order.exchange_buffer_percent;
  order.exchangeRate = order.exchange_rate_used;
  order.paymentStatus = "paid";
  order.paymentMethod = "online";
  order.paymentProviderMethod =
    paymentIntent?.payment_method_types?.join(", ") || order.paymentProviderMethod || "stripe";
  order.paymentProviderStatus = paymentIntent?.status || order.paymentProviderStatus;
  order.stripePaymentIntentId = paymentIntent?.id || order.stripePaymentIntentId;
  order.paymentFailureReason = "";
  order.paidAt = order.paidAt || new Date();

  if (!order.stockDeductedAt) {
    for (const item of order.products) {
      await Product.decrementStock(item.productId, item.quantity);
    }

    order.stockDeductedAt = new Date();
  }

  if (!order.adminPaymentSuccessEmailSentAt) {
    const emailSent = await sendAdminPaymentSuccessEmail({
      ...order.toObject(),
      userEmail,
    });

    if (emailSent) {
      order.adminPaymentSuccessEmailSentAt = new Date();
    }
  }

  await order.save();
  return order;
};

const recordFailedStripePayment = async (order, paymentIntent, fallbackReason) => {
  if (order.paymentStatus === "paid") {
    return order;
  }

  const displayCurrency = String(
    paymentIntent?.metadata?.display_currency || order.displayCurrency || getDisplayCurrency(order.region)
  ).toUpperCase();
  const paymentCurrency = String(
    paymentIntent?.currency || paymentIntent?.metadata?.payment_currency || order.paymentCurrency || getPaymentCurrency(order.region)
  ).toUpperCase();
  const displayAmount =
    paymentIntent?.metadata?.display_amount !== undefined
      ? Number(paymentIntent.metadata.display_amount)
      : Number(order.totalPrice || order.amount || 0);
  const paymentAmount =
    paymentIntent?.metadata?.payment_amount
      ? Number(paymentIntent.metadata.payment_amount)
      : amountFromMinorUnit(paymentIntent?.amount, paymentCurrency);

  order.region = normalizeRegion(paymentIntent?.metadata?.region || order.region);
  order.currency = displayCurrency;
  order.displayCurrency = displayCurrency;
  order.paymentCurrency = paymentCurrency;
  order.paymentAmount = paymentAmount;
  order.amount = displayAmount;
  order.original_amount_kwd =
    paymentIntent?.metadata?.original_amount_kwd !== undefined &&
    paymentIntent?.metadata?.original_amount_kwd !== ""
      ? Number(paymentIntent.metadata.original_amount_kwd)
      : order.original_amount_kwd;
  order.converted_amount_usd =
    paymentIntent?.metadata?.converted_amount_usd !== undefined &&
    paymentIntent?.metadata?.converted_amount_usd !== ""
      ? Number(paymentIntent.metadata.converted_amount_usd)
      : order.converted_amount_usd;
  order.exchange_rate_used =
    paymentIntent?.metadata?.exchange_rate_used !== undefined &&
    paymentIntent?.metadata?.exchange_rate_used !== ""
      ? Number(paymentIntent.metadata.exchange_rate_used)
      : order.exchange_rate_used;
  order.exchange_buffer_percent =
    paymentIntent?.metadata?.exchange_buffer_percent !== undefined &&
    paymentIntent?.metadata?.exchange_buffer_percent !== ""
      ? Number(paymentIntent.metadata.exchange_buffer_percent)
      : order.exchange_buffer_percent;
  order.exchangeRate = order.exchange_rate_used;
  order.paymentStatus = paymentIntent?.status === "canceled" ? "cancelled" : "failed";
  order.paymentMethod = "online";
  order.paymentProviderMethod =
    paymentIntent?.payment_method_types?.join(", ") || order.paymentProviderMethod || "stripe";
  order.paymentProviderStatus = paymentIntent?.status || order.paymentProviderStatus;
  order.stripePaymentIntentId = paymentIntent?.id || order.stripePaymentIntentId;
  order.paymentFailureReason =
    paymentIntent?.last_payment_error?.message || fallbackReason || order.paymentFailureReason || "Payment failed";

  await order.save();
  return order;
};

router.post("/create", verifyAccessToken, async (req, res, next) => {
  try {
    const { products, shippingAddress, notes, paymentMethod = "cod", region } = req.body;
    const userId = req.user.id;
    const resolvedRegion = normalizeRegion(region || inferRegionFromCountry(shippingAddress?.country));
    const currencyConfig = getCurrencyConfig(resolvedRegion);

    if (!Array.isArray(products) || products.length === 0) {
      const error = new Error("Products array is required and cannot be empty");
      error.statusCode = 400;
      throw error;
    }

    if (
      !shippingAddress?.name ||
      !shippingAddress?.phone ||
      !shippingAddress?.address ||
      !shippingAddress?.city
    ) {
      const error = new Error("Shipping address is incomplete");
      error.statusCode = 400;
      throw error;
    }

    console.log("[ORDER] Starting order creation", {
      userId,
      itemCount: products.length,
      paymentMethod,
      region: resolvedRegion,
    });

    let totalPrice = 0;
    const orderProducts = [];

    for (const item of products) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        const error = new Error("Each product must include a valid productId and quantity");
        error.statusCode = 400;
        throw error;
      }

      if (!isValidObjectId(item.productId)) {
        const error = new Error(`Invalid product ID format: "${item.productId}"`);
        error.statusCode = 400;
        throw error;
      }

      const product = await Product.findById(item.productId);

      if (!product || product.isActive === false) {
        const error = new Error(`Product ${item.productId} is not available`);
        error.statusCode = 404;
        throw error;
      }

      if (product.stock < item.quantity) {
        const error = new Error(`Insufficient stock for ${product.title}`);
        error.statusCode = 400;
        throw error;
      }

      const localizedPrice = convertAmountForRegion(product.price, resolvedRegion);
      totalPrice += localizedPrice * item.quantity;

      orderProducts.push({
        productId: product._id,
        title: product.title,
        price: localizedPrice,
        quantity: item.quantity,
        image: product.images?.[0] || "",
      });
    }

    const roundedTotalPrice = Number(totalPrice.toFixed(currencyConfig.displayDecimalPlaces));

    if (roundedTotalPrice <= 0) {
      const error = new Error("Order amount must be greater than 0");
      error.statusCode = 400;
      throw error;
    }

    const normalizedMethod = normalizePaymentMethod(paymentMethod);

    await User.findByIdAndUpdate(userId, {
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      city: shippingAddress.city,
      country: shippingAddress.country || currencyConfig.country,
      postalCode: shippingAddress.pincode || "",
    });

    const order = await Order.create({
      userId,
      products: orderProducts,
      totalPrice: roundedTotalPrice,
      amount: roundedTotalPrice,
      region: resolvedRegion,
      currency: getDisplayCurrency(resolvedRegion),
      displayCurrency: getDisplayCurrency(resolvedRegion),
      paymentCurrency: getPaymentCurrency(resolvedRegion),
      paymentAmount: null,
      original_amount_kwd: getDisplayCurrency(resolvedRegion) === "KWD" ? roundedTotalPrice : null,
      converted_amount_usd: null,
      exchange_rate_used: null,
      exchange_buffer_percent: null,
      exchangeRate: resolvedRegion === "india" ? Number(process.env.KWD_TO_INR_RATE || 270) : null,
      paymentMethod: normalizedMethod,
      paymentStatus: "pending",
      orderStatus: "processing",
      shippingAddress: {
        ...shippingAddress,
        country: shippingAddress.country || currencyConfig.country,
      },
      notes: notes || "",
    });

    let payment = null;

    if (normalizedMethod === "online") {
      payment = await createStripePaymentIntent({
        amount: roundedTotalPrice,
        region: resolvedRegion,
        customerEmail: req.user.email,
        metadata: {
          orderId: order._id.toString(),
          userId,
        },
        idempotencyKey: `order_${order._id.toString()}_payment_create`,
      });

      order.stripePaymentIntentId = payment.paymentIntent.id;
      order.paymentProviderStatus = payment.paymentIntent.status;
      await order.save();
    }

    order.userEmail = req.user.email;

    if (normalizedMethod === "cod") {
      for (const item of orderProducts) {
        await Product.decrementStock(item.productId, item.quantity);
      }

      order.stockDeductedAt = new Date();
      await order.save();
    }

    Promise.resolve(sendOrderEmail(order)).catch((mailError) => {
      console.error("[MAIL] Email send failed", mailError.message);
    });

    const responsePayload = {
      success: true,
      order,
      paymentRequired: normalizedMethod === "online",
    };

    if (payment) {
      order.paymentCurrency = payment.paymentCurrency;
      order.paymentAmount = payment.paymentAmount;
      order.original_amount_kwd = payment.original_amount_kwd;
      order.converted_amount_usd = payment.converted_amount_usd;
      order.exchange_rate_used = payment.exchange_rate_used;
      order.exchange_buffer_percent = payment.exchange_buffer_percent;
      order.exchangeRate = payment.exchange_rate_used;
      responsePayload.payment = {
        provider: "stripe",
        clientSecret: payment.clientSecret,
        paymentIntentId: payment.paymentIntent.id,
        amount: payment.displayAmount,
        currency: payment.displayCurrency,
        displayCurrency: payment.displayCurrency,
        displayAmount: payment.displayAmount,
        paymentCurrency: payment.paymentCurrency,
        paymentAmount: payment.paymentAmount,
        original_amount_kwd: payment.original_amount_kwd,
        converted_amount_usd: payment.converted_amount_usd,
        exchange_rate_used: payment.exchange_rate_used,
        exchange_buffer_percent: payment.exchange_buffer_percent,
        publishableKey: getStripePublicConfig().publishableKey,
      };

      await order.save();
    }

    res.status(201).json(responsePayload);
  } catch (error) {
    next(error);
  }
});

router.post("/verify", verifyAccessToken, async (req, res, next) => {
  try {
    const paymentIntentId =
      req.body.payment_intent_id ||
      req.body.stripe_payment_intent_id ||
      req.body.paymentIntentId;

    if (!paymentIntentId) {
      const error = new Error("Stripe PaymentIntent ID is required");
      error.statusCode = 400;
      error.code = "STRIPE_PAYMENT_INTENT_ID_REQUIRED";
      throw error;
    }

    const paymentIntent = await fetchStripePaymentIntent(paymentIntentId);
    const order = await findOrderByPaymentIntentForUser(paymentIntentId, req.user.id);

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    if (isFailedPaymentIntent(paymentIntent)) {
      await recordFailedStripePayment(order, paymentIntent);
    }

    if (paymentIntent.status === "succeeded" && order.paymentStatus !== "paid") {
      await finalizeSuccessfulStripePayment(order, paymentIntent, req.user.email);
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: {
          orderId: order._id,
          paymentStatus: order.paymentStatus,
          paidAt: order.paidAt,
          paymentProviderStatus: order.paymentProviderStatus,
        },
      });
    }

    res.status(200).json({
      success: true,
      message:
        paymentIntent.status === "succeeded"
          ? "Payment is successful on Stripe and awaiting webhook confirmation"
          : "Payment status fetched successfully",
      data: {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        paidAt: order.paidAt,
        paymentProviderStatus: paymentIntent.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/payment-failure", verifyAccessToken, async (req, res, next) => {
  try {
    const paymentIntentId =
      req.body.payment_intent_id ||
      req.body.stripe_payment_intent_id ||
      req.body.paymentIntentId;
    const fallbackReason = [req.body.error_description, req.body.error_reason]
      .filter(Boolean)
      .join(" | ");

    if (!paymentIntentId) {
      return res.status(200).json({
        success: true,
        message: "Payment failure callback acknowledged",
      });
    }

    const order = await findOrderByPaymentIntentForUser(paymentIntentId, req.user.id);

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    const paymentIntent = await fetchStripePaymentIntent(paymentIntentId);

    if (isFailedPaymentIntent(paymentIntent)) {
      await recordFailedStripePayment(order, paymentIntent, fallbackReason);
    }

    res.status(200).json({
      success: true,
      message: "Payment failure recorded successfully",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/my-orders", verifyAccessToken, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:orderId", verifyAccessToken, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.id,
    }).populate("products.productId", "title price images");

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/", verifyAccessToken, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: {
        orders,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
