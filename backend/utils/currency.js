const DEFAULT_REGION = "kuwait";
const DEFAULT_DISPLAY_CURRENCY = "KWD";
const DEFAULT_PAYMENT_CURRENCY = "USD";
const DEFAULT_KWD_TO_INR_RATE = 270;

const REGION_CONFIG = {
  india: {
    region: "india",
    displayCurrency: "INR",
    paymentCurrency: "INR",
    displayMultiplier: 100,
    paymentMultiplier: 100,
    country: "India",
    displayDecimalPlaces: 2,
    paymentDecimalPlaces: 2,
  },
  kuwait: {
    region: "kuwait",
    displayCurrency: "KWD",
    paymentCurrency: "USD",
    displayMultiplier: 1000,
    paymentMultiplier: 100,
    country: "Kuwait",
    displayDecimalPlaces: 3,
    paymentDecimalPlaces: 2,
  },
};

const normalizeRate = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : DEFAULT_KWD_TO_INR_RATE;
};

export function normalizeRegion(region, fallbackRegion = DEFAULT_REGION) {
  const normalizedRegion = String(region || fallbackRegion).trim().toLowerCase();

  if (normalizedRegion === "others" || normalizedRegion === "other") {
    return "india";
  }

  if (normalizedRegion === "kuwait") {
    return "kuwait";
  }

  return "india";
}

export function getCurrencyConfig(region) {
  return REGION_CONFIG[normalizeRegion(region)];
}

export function getDisplayCurrency(region) {
  return (
    getCurrencyConfig(region).displayCurrency ||
    process.env.DISPLAY_CURRENCY ||
    DEFAULT_DISPLAY_CURRENCY
  );
}

export function getPaymentCurrency(region) {
  return (
    getCurrencyConfig(region).paymentCurrency ||
    process.env.PAYMENT_CURRENCY ||
    DEFAULT_PAYMENT_CURRENCY
  );
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

export function convertAmountForRegion(amount, region) {
  const normalizedRegion = normalizeRegion(region);
  const numericAmount = Number(amount) || 0;

  if (normalizedRegion === "india") {
    return convertKwdToInr(numericAmount);
  }

  return Number(
    numericAmount.toFixed(getCurrencyConfig(normalizedRegion).displayDecimalPlaces)
  );
}

export function convertToMinorUnit(amount, region, currencyType = "display") {
  const config = getCurrencyConfig(region);
  const numericAmount = Number(amount) || 0;
  const multiplier =
    currencyType === "payment" ? config.paymentMultiplier : config.displayMultiplier;

  return Math.round(numericAmount * multiplier);
}

export function inferRegionFromCountry(country) {
  const normalizedCountry = String(country || "").trim().toLowerCase();
  return normalizedCountry === "kuwait" ? "kuwait" : "india";
}

export default {
  getDisplayCurrency,
  getPaymentCurrency,
  getKwdToInrRate,
  convertKwdToInr,
  convertKwdToInrPaise,
  normalizeRegion,
  getCurrencyConfig,
  convertAmountForRegion,
  convertToMinorUnit,
  inferRegionFromCountry,
};
