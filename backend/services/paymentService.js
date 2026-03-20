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

export async function createRazorpayOrder(amountInPaise, receipt, notes = {}) {
  if (!razorpayInstance) {
    throw new Error("Razorpay is not configured");
  }

  console.log("[PAYMENT] Creating Razorpay order", {
    amountInPaise,
    currency: "INR",
    receipt,
  });

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
  verifyRazorpaySignature,
  getRazorpayPublicConfig,
};
