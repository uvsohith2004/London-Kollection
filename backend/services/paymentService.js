import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import {
  convertToMinorUnit,
  getCurrencyConfig,
  getDisplayCurrency,
  getPaymentCurrency,
  normalizeRegion,
} from "../utils/currency.js";
import { convertAmountWithExchangeRate } from "./exchangeRateService.js";

const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY ||
  process.env.Stripe_Secret_key ||
  process.env.Secret_key;
const STRIPE_PUBLISHABLE_KEY =
  process.env.STRIPE_PUBLISHABLE_KEY ||
  process.env.Stripe_Publishable_key ||
  process.env.Publishable_key;
const STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOKSIGNINGSECRET;

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    })
  : null;

if (stripe) {
  console.log("[PAYMENT] Stripe initialized successfully");
} else {
  console.warn("[PAYMENT] Stripe keys missing. Payment features are disabled.");
}

const normalizeStripeError = (sdkError, fallbackMessage, fallbackCode) => {
  const normalizedError = new Error(
    sdkError?.message || sdkError?.raw?.message || fallbackMessage
  );

  normalizedError.name = sdkError?.name || "StripeError";
  normalizedError.code = sdkError?.code || fallbackCode;
  normalizedError.statusCode = sdkError?.statusCode || sdkError?.raw?.statusCode || 502;
  normalizedError.details = sdkError?.raw || null;

  return normalizedError;
};

export function ensureStripeConfigured() {
  if (!stripe) {
    const error = new Error("Stripe is not configured");
    error.statusCode = 500;
    error.code = "STRIPE_NOT_CONFIGURED";
    throw error;
  }
}

export function getStripePublicConfig() {
  return {
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    configured: Boolean(stripe && STRIPE_PUBLISHABLE_KEY),
  };
}

export async function resolvePaymentDetails({ amount, region }) {
  const normalizedRegion = normalizeRegion(region);
  const currencyConfig = getCurrencyConfig(normalizedRegion);
  const displayCurrency = getDisplayCurrency(normalizedRegion);
  const paymentCurrency = getPaymentCurrency(normalizedRegion);
  const displayAmount = Number(
    (Number(amount) || 0).toFixed(currencyConfig.displayDecimalPlaces)
  );

  let paymentAmount = displayAmount;
  let exchangeRateUsed = 1;
  let exchangeBufferPercent = 0;
  let bufferedExchangeRate = 1;

  if (displayCurrency !== paymentCurrency) {
    const conversion = await convertAmountWithExchangeRate({
      amount: displayAmount,
      baseCurrency: displayCurrency,
      quoteCurrency: paymentCurrency,
      quoteDecimalPlaces: currencyConfig.paymentDecimalPlaces,
    });

    paymentAmount = conversion.convertedAmount;
    exchangeRateUsed = conversion.exchangeRateUsed;
    exchangeBufferPercent = conversion.bufferPercent;
    bufferedExchangeRate = conversion.bufferedExchangeRate;
  }

  const amountInMinorUnit = convertToMinorUnit(paymentAmount, normalizedRegion, "payment");

  return {
    region: normalizedRegion,
    currency: paymentCurrency,
    amount: paymentAmount,
    amountInMinorUnit,
    displayCurrency,
    displayAmount,
    paymentCurrency,
    paymentAmount,
    original_amount_kwd: displayCurrency === "KWD" ? displayAmount : null,
    converted_amount_usd: paymentCurrency === "USD" ? paymentAmount : null,
    exchange_rate_used: exchangeRateUsed,
    exchange_buffer_percent: exchangeBufferPercent,
    buffered_exchange_rate: bufferedExchangeRate,
  };
}

export async function createStripePaymentIntent({
  amount,
  region,
  metadata = {},
  idempotencyKey,
  customerEmail,
}) {
  ensureStripeConfigured();

  const payment = await resolvePaymentDetails({ amount, region });

  if (payment.amount <= 0 || payment.amountInMinorUnit <= 0) {
    const error = new Error("Payment amount must be greater than 0");
    error.statusCode = 400;
    error.code = "INVALID_PAYMENT_AMOUNT";
    throw error;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: payment.amountInMinorUnit,
        currency: payment.currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: customerEmail || undefined,
        metadata: {
          region: payment.region,
          display_currency: payment.displayCurrency,
          display_amount: String(payment.displayAmount),
          payment_currency: payment.paymentCurrency,
          payment_amount: String(payment.paymentAmount),
          original_amount: String(payment.displayAmount),
          original_amount_kwd:
            payment.original_amount_kwd !== null ? String(payment.original_amount_kwd) : "",
          converted_amount_usd:
            payment.converted_amount_usd !== null ? String(payment.converted_amount_usd) : "",
          exchange_rate_used: String(payment.exchange_rate_used),
          exchange_buffer_percent: String(payment.exchange_buffer_percent),
          buffered_exchange_rate: String(payment.buffered_exchange_rate),
          ...Object.fromEntries(
            Object.entries(metadata)
              .filter(([, value]) => value !== undefined && value !== null && value !== "")
              .map(([key, value]) => [key, String(value)])
          ),
        },
      },
      idempotencyKey ? { idempotencyKey } : undefined
    );

    console.log("[PAYMENT] Stripe PaymentIntent created", {
      paymentIntentId: paymentIntent.id,
      currency: payment.currency,
      amountInMinorUnit: payment.amountInMinorUnit,
      region: payment.region,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      currency: payment.currency,
      amount: payment.amount,
      amountInMinorUnit: payment.amountInMinorUnit,
      region: payment.region,
      displayCurrency: payment.displayCurrency,
      displayAmount: payment.displayAmount,
      paymentCurrency: payment.paymentCurrency,
      paymentAmount: payment.paymentAmount,
      original_amount_kwd: payment.original_amount_kwd,
      converted_amount_usd: payment.converted_amount_usd,
      exchange_rate_used: payment.exchange_rate_used,
      exchange_buffer_percent: payment.exchange_buffer_percent,
      paymentIntent,
    };
  } catch (sdkError) {
    const normalizedError = normalizeStripeError(
      sdkError,
      "Failed to create Stripe PaymentIntent",
      "STRIPE_PAYMENT_INTENT_CREATE_FAILED"
    );

    console.error("[PAYMENT] Stripe PaymentIntent creation failed", {
      code: normalizedError.code,
      statusCode: normalizedError.statusCode,
      message: normalizedError.message,
    });

    throw normalizedError;
  }
}

export async function fetchStripePaymentIntent(paymentIntentId) {
  ensureStripeConfigured();

  if (!paymentIntentId) {
    const error = new Error("Stripe PaymentIntent ID is required");
    error.statusCode = 400;
    error.code = "STRIPE_PAYMENT_INTENT_ID_REQUIRED";
    throw error;
  }

  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (sdkError) {
    throw normalizeStripeError(
      sdkError,
      "Failed to fetch Stripe PaymentIntent",
      "STRIPE_PAYMENT_INTENT_FETCH_FAILED"
    );
  }
}

export function constructStripeWebhookEvent(payload, signature) {
  ensureStripeConfigured();

  if (!STRIPE_WEBHOOK_SECRET) {
    const error = new Error("Stripe webhook secret is not configured");
    error.statusCode = 500;
    error.code = "STRIPE_WEBHOOK_NOT_CONFIGURED";
    throw error;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (sdkError) {
    throw normalizeStripeError(
      sdkError,
      "Invalid Stripe webhook signature",
      "STRIPE_WEBHOOK_SIGNATURE_INVALID"
    );
  }
}

export default {
  getStripePublicConfig,
  ensureStripeConfigured,
  resolvePaymentDetails,
  createStripePaymentIntent,
  fetchStripePaymentIntent,
  constructStripeWebhookEvent,
};
