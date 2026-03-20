export function normalizePaymentMethod(paymentMethod) {
  const normalizedMethod = String(paymentMethod || "cod").toLowerCase();

  if (normalizedMethod === "online") {
    return "razorpay";
  }

  return normalizedMethod;
}

export function getPaymentMethodLabel(paymentMethod) {
  const normalizedMethod = normalizePaymentMethod(paymentMethod);

  if (normalizedMethod === "razorpay") {
    return "Online Payment";
  }

  return "Cash on Delivery";
}

export default {
  normalizePaymentMethod,
  getPaymentMethodLabel,
};
