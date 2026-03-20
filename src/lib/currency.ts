const DISPLAY_CURRENCY = import.meta.env.VITE_DISPLAY_CURRENCY || "KWD";
const PAYMENT_CURRENCY = import.meta.env.VITE_PAYMENT_CURRENCY || "INR";
const DEFAULT_KWD_TO_INR_RATE = Number(import.meta.env.VITE_KWD_TO_INR_RATE || 270);

function normalizeAmount(amount: number | string) {
  const numericAmount = typeof amount === "number" ? amount : Number(amount || 0);
  return Number.isFinite(numericAmount) ? numericAmount : 0;
}

export function getDisplayCurrency() {
  return DISPLAY_CURRENCY;
}

export function getPaymentCurrency() {
  return PAYMENT_CURRENCY;
}

export function getKwdToInrRate() {
  return Number.isFinite(DEFAULT_KWD_TO_INR_RATE) && DEFAULT_KWD_TO_INR_RATE > 0
    ? DEFAULT_KWD_TO_INR_RATE
    : 270;
}

export function convertKwdToInr(amount: number | string) {
  return Number((normalizeAmount(amount) * getKwdToInrRate()).toFixed(2));
}

export function formatKwd(amount: number | string) {
  return new Intl.NumberFormat("en-KW", {
    style: "currency",
    currency: DISPLAY_CURRENCY,
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(normalizeAmount(amount));
}

export function formatInr(amount: number | string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: PAYMENT_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(normalizeAmount(amount));
}
