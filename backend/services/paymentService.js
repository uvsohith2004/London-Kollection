import dotenv from "dotenv";
dotenv.config();

import Razorpay from "razorpay";
import crypto from "crypto";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpayInstance =
  RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      })
    : null;

if (razorpayInstance) {
  console.log("Razorpay initialized successfully");
} else {
  console.warn("Razorpay keys missing. Payment gateway features are disabled.");
}

export function getRazorpayPublicConfig() {
  return {
    key: RAZORPAY_KEY_ID,
    configured: Boolean(razorpayInstance),
  };
}

export async function fetchRazorpayPayment(paymentId) {
  if (!razorpayInstance) {
    const error = new Error("Razorpay is not configured");
    error.statusCode = 500;
    error.code = "RAZORPAY_NOT_CONFIGURED";
    throw error;
  }

  if (!paymentId) {
    const error = new Error("Razorpay payment ID is required");
    error.statusCode = 400;
    error.code = "RAZORPAY_PAYMENT_ID_REQUIRED";
    throw error;
  }

  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);

    console.log("[PAYMENT] Razorpay payment fetched", {
      paymentId: payment?.id,
      method: payment?.method,
      status: payment?.status,
    });

    return payment;
  } catch (sdkError) {
    const normalizedError = new Error(
      sdkError?.error?.description ||
        sdkError?.description ||
        sdkError?.message ||
        "Failed to fetch Razorpay payment details"
    );

    normalizedError.name = sdkError?.name || "RazorpayPaymentFetchError";
    normalizedError.code =
      sdkError?.error?.code || sdkError?.code || "RAZORPAY_PAYMENT_FETCH_FAILED";
    normalizedError.statusCode =
      sdkError?.statusCode || sdkError?.error?.statusCode || 502;

    throw normalizedError;
  }
}

export async function createRazorpayOrder(amountInPaise, receipt, notes = {}) {
  if (!razorpayInstance) {
    const error = new Error("Razorpay is not configured");
    error.statusCode = 500;
    error.code = "RAZORPAY_NOT_CONFIGURED";
    throw error;
  }

  console.log("[PAYMENT] Creating Razorpay order", {
    amountInPaise,
    currency: "INR",
    receipt,
  });

  try {
    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes,
    });

    console.log("[PAYMENT] Razorpay order created", {
      razorpayOrderId: order.id,
      amount: order.amount,
    });

    return order;
  } catch (sdkError) {
    const normalizedError = new Error(
      sdkError?.error?.description ||
        sdkError?.description ||
        sdkError?.message ||
        "Failed to create Razorpay order"
    );

    normalizedError.name = sdkError?.name || "RazorpayOrderError";
    normalizedError.code =
      sdkError?.error?.code || sdkError?.code || "RAZORPAY_ORDER_CREATE_FAILED";
    normalizedError.statusCode =
      sdkError?.statusCode || sdkError?.error?.statusCode || 502;
    normalizedError.details = sdkError?.error || null;

    console.error("[PAYMENT] Razorpay order creation failed", {
      code: normalizedError.code,
      statusCode: normalizedError.statusCode,
      message: normalizedError.message,
      details: normalizedError.details,
    });

    throw normalizedError;
  }
}

export function verifyRazorpaySignature(orderId, paymentId, signature) {
  if (!RAZORPAY_KEY_SECRET) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const isValid = generatedSignature === signature;

  console.log("[PAYMENT] Signature verification result", {
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    isValid,
  });

  return isValid;
}

export default {
  createRazorpayOrder,
  fetchRazorpayPayment,
  verifyRazorpaySignature,
  getRazorpayPublicConfig,
};
