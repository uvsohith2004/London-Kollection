import express from "express";
import mongoose from "mongoose";
import { verifyAccessToken } from "../middleware/auth.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import {
  createRazorpayOrder,
  getRazorpayPublicConfig,
  verifyRazorpaySignature,
} from "../services/paymentService.js";
import { sendOrderEmail } from "../services/mailService.js";

const router = express.Router();

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizePaymentMethod = (paymentMethod) => {
  const normalizedMethod = String(paymentMethod || "cod").toLowerCase();

  if (normalizedMethod === "online") {
    return "razorpay";
  }

  return normalizedMethod;
};

const buildReceipt = (userId) => {
  const userIdShort = String(userId).slice(-6);
  const timeShort = Date.now().toString().slice(-8);
  return `rcpt_${userIdShort}_${timeShort}`.slice(0, 40);
};

router.post("/create", verifyAccessToken, async (req, res, next) => {
  try {
    const { products, shippingAddress, notes, paymentMethod = "cod" } = req.body;
    const userId = req.user.id;

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

      totalPrice += product.price * item.quantity;

      orderProducts.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0] || "",
      });
    }

    const roundedTotalPrice = Number(totalPrice.toFixed(2));

    if (roundedTotalPrice <= 0) {
      const error = new Error("Order amount must be greater than 0");
      error.statusCode = 400;
      throw error;
    }

    const normalizedMethod = normalizePaymentMethod(paymentMethod);

    // Persist the customer's latest contact and address details on the user document.
    await User.findByIdAndUpdate(userId, {
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      address: shippingAddress.address,
      city: shippingAddress.city,
      country: shippingAddress.country || "India",
      postalCode: shippingAddress.pincode || "",
    });

    let razorpayOrder = null;
    if (normalizedMethod === "razorpay") {
      const { key, configured } = getRazorpayPublicConfig();

      if (!configured || !key) {
        const error = new Error("Online payment is not configured");
        error.statusCode = 500;
        throw error;
      }

      const amountInPaise = Math.round(roundedTotalPrice * 100);
      const receipt = buildReceipt(userId);

      razorpayOrder = await createRazorpayOrder(amountInPaise, receipt, {
        userId,
        userEmail: req.user.email,
        items: String(orderProducts.length),
      });
    }

    const order = await Order.create({
      userId,
      products: orderProducts,
      totalPrice: roundedTotalPrice,
      currency: "INR",
      paymentMethod: normalizedMethod,
      paymentStatus: "pending",
      orderStatus: "processing",
      razorpayOrderId: razorpayOrder?.id || undefined,
      shippingAddress: {
        ...shippingAddress,
        country: shippingAddress.country || "India",
      },
      notes: notes || "",
    });

    order.userEmail = req.user.email;

    if (normalizedMethod === "cod") {
      for (const item of orderProducts) {
        await Product.decrementStock(item.productId, item.quantity);
      }
    }

    console.log("[ORDER] Order saved in database", {
      orderId: order._id.toString(),
      razorpayOrderId: order.razorpayOrderId || null,
      paymentStatus: order.paymentStatus,
    });

    try {
      await sendOrderEmail(order);
    } catch (mailError) {
      console.error("[MAIL] Email send failed", mailError.message);
    }

    const responsePayload = {
      success: true,
      order,
      paymentRequired: normalizedMethod === "razorpay",
    };

    if (razorpayOrder) {
      responsePayload.payment = {
        key: getRazorpayPublicConfig().key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: razorpayOrder.id,
        receipt: razorpayOrder.receipt,
      };

      console.log("[PAYMENT] Returning Razorpay order to frontend", {
        orderId: order._id.toString(),
        razorpayOrderId: razorpayOrder.id,
      });
    }

    res.status(201).json(responsePayload);
  } catch (error) {
    next(error);
  }
});

router.post("/verify", verifyAccessToken, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      const error = new Error("Payment verification fields are required");
      error.statusCode = 400;
      throw error;
    }

    console.log("[PAYMENT] Payment success response received", {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.user.id,
    });

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: {
          orderId: order._id,
          paymentStatus: order.paymentStatus,
        },
      });
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      const error = new Error("Invalid payment signature");
      error.statusCode = 400;
      throw error;
    }

    order.paymentStatus = "paid";
    order.paymentMethod = "razorpay";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paidAt = new Date();
    await order.save();

    console.log("[PAYMENT] Database updated", {
      orderId: order._id.toString(),
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
    });

    for (const item of order.products) {
      await Product.decrementStock(item.productId, item.quantity);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        paidAt: order.paidAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/payment-failure", verifyAccessToken, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, error_description, error_reason } = req.body;

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.user.id,
    });

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      throw error;
    }

    order.paymentStatus = "failed";
    order.paymentFailureReason = [error_description, error_reason].filter(Boolean).join(" | ");
    if (razorpay_payment_id) {
      order.razorpayPaymentId = razorpay_payment_id;
    }
    await order.save();

    console.error("[PAYMENT] Payment failed", {
      orderId: order._id.toString(),
      razorpayOrderId: razorpay_order_id,
      error: order.paymentFailureReason || "Unknown payment failure",
    });

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
