const DEFAULT_DISPLAY_CURRENCY = "KWD";
const DEFAULT_PAYMENT_CURRENCY = "INR";
const DEFAULT_KWD_TO_INR_RATE = 270;

const normalizeRate = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : DEFAULT_KWD_TO_INR_RATE;
};

export function getDisplayCurrency() {
  return process.env.DISPLAY_CURRENCY || DEFAULT_DISPLAY_CURRENCY;
}

export function getPaymentCurrency() {
  return process.env.PAYMENT_CURRENCY || DEFAULT_PAYMENT_CURRENCY;
}

export function getKwdToInrRate() {
  return normalizeRate(process.env.KWD_TO_INR_RATE);
}

export function convertKwdToInr(amountInKwd) {
  const numericAmount = Number(amountInKwd) || 0;
  return Number((numericAmount * getKwdToInrRate()).toFixed(2));
}

export function convertKwdToInrPaise(amountInKwd) {
  return Math.round(convertKwdToInr(amountInKwd) * 100);
}

export default {
  getDisplayCurrency,
  getPaymentCurrency,
  getKwdToInrRate,
  convertKwdToInr,
  convertKwdToInrPaise,
};
