export function normalizePaymentMethod(paymentMethod) {
  const normalizedMethod = String(paymentMethod || "cod").toLowerCase();

  if (normalizedMethod === "online" || normalizedMethod === "razorpay" || normalizedMethod === "stripe") {
    return "online";
  }

  return normalizedMethod;
}

export function getPaymentMethodLabel(paymentMethod) {
  const normalizedMethod = normalizePaymentMethod(paymentMethod);

  if (normalizedMethod === "online") {
    return "Online Payment";
  }

  return "Cash on Delivery";
}

export default {
  normalizePaymentMethod,
  getPaymentMethodLabel,
};
