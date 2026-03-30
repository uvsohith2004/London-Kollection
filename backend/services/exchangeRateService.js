const DEFAULT_KWD_TO_USD_RATE = 3.25;
const DEFAULT_BUFFER_PERCENT = 2;
const CACHE_TTL_MS = 15 * 60 * 1000;

const cachedRates = new Map();

const normalizePositiveNumber = (value, fallbackValue) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallbackValue;
};

const roundAmount = (amount, decimalPlaces) =>
  Number((Number(amount) || 0).toFixed(decimalPlaces));

const getCacheKey = (baseCurrency, quoteCurrency) =>
  `${String(baseCurrency || "").toUpperCase()}_${String(quoteCurrency || "").toUpperCase()}`;

export function getExchangeRateBufferPercent() {
  return normalizePositiveNumber(
    process.env.PAYMENT_EXCHANGE_BUFFER_PERCENT || process.env.EXCHANGE_BUFFER_PERCENT,
    DEFAULT_BUFFER_PERCENT
  );
}

export function getFallbackExchangeRate(baseCurrency, quoteCurrency) {
  const cacheKey = getCacheKey(baseCurrency, quoteCurrency);

  if (cacheKey === "KWD_USD") {
    return normalizePositiveNumber(
      process.env.KWD_TO_USD_RATE || process.env.EXCHANGE_RATE_FALLBACK_KWD_USD,
      DEFAULT_KWD_TO_USD_RATE
    );
  }

  if (cacheKey === "USD_KWD") {
    return roundAmount(1 / getFallbackExchangeRate("KWD", "USD"), 6);
  }

  return 1;
}

async function fetchLiveExchangeRate(baseCurrency, quoteCurrency) {
  const apiUrl =
    process.env.EXCHANGE_RATE_API_URL || "https://api.exchangerate.host/latest";
  const url = new URL(apiUrl);

  url.searchParams.set("base", String(baseCurrency || "").toUpperCase());
  url.searchParams.set("symbols", String(quoteCurrency || "").toUpperCase());

  if (process.env.EXCHANGE_RATE_API_KEY) {
    url.searchParams.set("access_key", process.env.EXCHANGE_RATE_API_KEY);
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Exchange rate provider returned ${response.status}`);
  }

  const payload = await response.json();
  const directRate = payload?.rates?.[String(quoteCurrency || "").toUpperCase()];
  const normalizedRate = Number(directRate);

  if (!Number.isFinite(normalizedRate) || normalizedRate <= 0) {
    throw new Error("Exchange rate provider returned an invalid rate");
  }

  return normalizedRate;
}

export async function getExchangeRate(baseCurrency, quoteCurrency) {
  const base = String(baseCurrency || "").toUpperCase();
  const quote = String(quoteCurrency || "").toUpperCase();

  if (!base || !quote || base === quote) {
    return 1;
  }

  const cacheKey = getCacheKey(base, quote);
  const cachedRate = cachedRates.get(cacheKey);

  if (cachedRate && Date.now() - cachedRate.updatedAt < CACHE_TTL_MS) {
    return cachedRate.rate;
  }

  try {
    const liveRate = await fetchLiveExchangeRate(base, quote);

    cachedRates.set(cacheKey, {
      rate: liveRate,
      updatedAt: Date.now(),
      source: "live",
    });

    return liveRate;
  } catch (error) {
    const fallbackRate = getFallbackExchangeRate(base, quote);

    console.warn("[FX] Falling back to configured exchange rate", {
      baseCurrency: base,
      quoteCurrency: quote,
      fallbackRate,
      reason: error.message,
    });

    cachedRates.set(cacheKey, {
      rate: fallbackRate,
      updatedAt: Date.now(),
      source: "fallback",
    });

    return fallbackRate;
  }
}

export async function convertAmountWithExchangeRate({
  amount,
  baseCurrency,
  quoteCurrency,
  quoteDecimalPlaces = 2,
  bufferPercent = getExchangeRateBufferPercent(),
}) {
  const normalizedAmount = Number(amount) || 0;
  const exchangeRate = await getExchangeRate(baseCurrency, quoteCurrency);
  const bufferMultiplier = 1 + bufferPercent / 100;
  const bufferedExchangeRate = exchangeRate * bufferMultiplier;
  const convertedAmount = roundAmount(
    normalizedAmount * bufferedExchangeRate,
    quoteDecimalPlaces
  );

  return {
    baseCurrency: String(baseCurrency || "").toUpperCase(),
    quoteCurrency: String(quoteCurrency || "").toUpperCase(),
    originalAmount: normalizedAmount,
    convertedAmount,
    exchangeRate,
    exchangeRateUsed: exchangeRate,
    bufferedExchangeRate: roundAmount(bufferedExchangeRate, 6),
    bufferPercent: roundAmount(bufferPercent, 3),
  };
}

export default {
  getExchangeRate,
  getFallbackExchangeRate,
  getExchangeRateBufferPercent,
  convertAmountWithExchangeRate,
};
