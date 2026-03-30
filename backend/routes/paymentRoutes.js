import express from "express";
import { verifyAccessToken } from "../middleware/auth.js";
import { createCheckoutSession } from "../controllers/paymentController.js";
import {
  constructStripeWebhookEvent,
  createStripePaymentIntent,
  fetchStripePaymentIntent,
  getStripePublicConfig,
} from "../services/paymentService.js";
import { getCurrencyConfig, getDisplayCurrency, getPaymentCurrency, normalizeRegion } from "../utils/currency.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendAdminPaymentSuccessEmail } from "../services/mailService.js";

const router = express.Router();

const amountFromMinorUnit = (amountInMinorUnit, currency) => {
  const upperCurrency = String(currency || "").toUpperCase();
  const divisor = upperCurrency === "KWD" ? 1000 : 100;
  const decimalPlaces = upperCurrency === "KWD" ? 3 : 2;
  return Number(((Number(amountInMinorUnit) || 0) / divisor).toFixed(decimalPlaces));
};

const resolveOrderFromPaymentIntent = async (paymentIntent) => {
  const metadataOrderId = paymentIntent?.metadata?.orderId;

  if (metadataOrderId) {
    return Order.findById(metadataOrderId);
  }

  return Order.findOne({ stripePaymentIntentId: paymentIntent.id });
};

const finalizeSuccessfulPayment = async (order, paymentIntent) => {
  if (!order) {
    return null;
  }

  const resolvedRegion = normalizeRegion(paymentIntent?.metadata?.region || order.region);
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
  const paidAmount =
    paymentIntent?.metadata?.payment_amount
      ? Number(paymentIntent.metadata.payment_amount)
      : amountFromMinorUnit(paymentIntent?.amount_received || paymentIntent?.amount, paymentCurrency);

  order.region = resolvedRegion;
  order.currency = displayCurrency;
  order.displayCurrency = displayCurrency;
  order.paymentCurrency = paymentCurrency;
  order.paymentAmount = paidAmount;
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
  order.paidAt = order.paidAt || new Date();
  order.paymentFailureReason = "";

  if (!order.stockDeductedAt) {
    for (const item of order.products) {
      await Product.decrementStock(item.productId, item.quantity);
    }

    order.stockDeductedAt = new Date();
  }

  if (!order.adminPaymentSuccessEmailSentAt) {
    const user = await User.findById(order.userId).select("email").lean();
    const emailSent = await sendAdminPaymentSuccessEmail({
      ...order.toObject(),
      userEmail: user?.email,
    });

    if (emailSent) {
      order.adminPaymentSuccessEmailSentAt = new Date();
    }
  }

  await order.save();
  return order;
};

const finalizeFailedPayment = async (order, paymentIntent) => {
  if (!order || order.paymentStatus === "paid") {
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
  order.paymentMethod = "online";
  order.paymentProviderMethod =
    paymentIntent?.payment_method_types?.join(", ") || order.paymentProviderMethod || "stripe";
  order.paymentProviderStatus = paymentIntent?.status || order.paymentProviderStatus;
  order.stripePaymentIntentId = paymentIntent?.id || order.stripePaymentIntentId;
  order.paymentStatus = "failed";
  order.paymentFailureReason =
    paymentIntent?.last_payment_error?.message || order.paymentFailureReason || "Payment failed";

  await order.save();
  return order;
};

router.post("/create-session", verifyAccessToken, createCheckoutSession);

router.post("/create", verifyAccessToken, async (req, res, next) => {
  try {
    const { amount, region } = req.body;

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      const error = new Error("A valid amount greater than 0 is required");
      error.statusCode = 400;
      error.code = "INVALID_PAYMENT_AMOUNT";
      throw error;
    }

    const payment = await createStripePaymentIntent({
      amount: Number(amount),
      region,
      customerEmail: req.user.email,
      metadata: {
        userId: req.user.id,
      },
      idempotencyKey: `payments_create_${req.user.id}_${normalizeRegion(region)}_${Number(amount).toFixed(3)}`,
    });

    res.status(201).json({
      success: true,
      clientSecret: payment.clientSecret,
      currency: payment.displayCurrency,
      displayCurrency: payment.displayCurrency,
      displayAmount: payment.displayAmount,
      paymentCurrency: payment.paymentCurrency,
      paymentAmount: payment.paymentAmount,
    });
  } catch (error) {
    next(error);
  }
});

export async function stripeWebhookHandler(req, res, next) {
  try {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      const error = new Error("Missing Stripe signature");
      error.statusCode = 400;
      error.code = "STRIPE_SIGNATURE_MISSING";
      throw error;
    }

    const event = constructStripeWebhookEvent(req.body, signature);
    const paymentIntent = event.data?.object;

    console.log("[PAYMENT] Stripe webhook received", {
      eventId: event.id,
      type: event.type,
      paymentIntentId: paymentIntent?.id,
    });

    if (event.type === "payment_intent.succeeded") {
      const order = await resolveOrderFromPaymentIntent(paymentIntent);
      await finalizeSuccessfulPayment(order, paymentIntent);
    }

    if (event.type === "payment_intent.payment_failed") {
      const order = await resolveOrderFromPaymentIntent(paymentIntent);
      await finalizeFailedPayment(order, paymentIntent);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
}

router.get("/intent/:paymentIntentId", verifyAccessToken, async (req, res, next) => {
  try {
    const paymentIntent = await fetchStripePaymentIntent(req.params.paymentIntentId);

    res.status(200).json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        currency: String(paymentIntent.metadata?.display_currency || paymentIntent.currency || "").toUpperCase(),
        amount:
          paymentIntent.metadata?.display_amount !== undefined
            ? Number(paymentIntent.metadata.display_amount)
            : amountFromMinorUnit(paymentIntent.amount, paymentIntent.currency),
        processingCurrency: String(paymentIntent.currency || "").toUpperCase(),
        processingAmount: amountFromMinorUnit(paymentIntent.amount, paymentIntent.currency),
      },
      stripe: getStripePublicConfig(),
      region: normalizeRegion(paymentIntent.metadata?.region),
      currencyConfig: getCurrencyConfig(paymentIntent.metadata?.region),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
