import Stripe from "stripe";

const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY ||
  process.env.Stripe_Secret_key ||
  process.env.Secret_key;

const STRIPE_WEBHOOK_SECRET =
  process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOKSIGNINGSECRET;

const stripe =
  STRIPE_SECRET_KEY
    ? new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: "2024-06-20",
      })
    : null;

const COUNTRY_PAYMENT_CONFIG = {
  IN: {
    currency: "inr",
    payment_method_types: ["card", "upi"],
    minorUnitMultiplier: 100,
  },
  KW: {
    currency: "kwd",
    payment_method_types: ["card"],
    minorUnitMultiplier: 1000,
  },
  DEFAULT: {
    currency: "usd",
    payment_method_types: ["card"],
    minorUnitMultiplier: 100,
  },
};

const normalizeStripeError = (error, fallbackMessage, fallbackCode) => {
  const normalizedError = new Error(
    error?.message || error?.raw?.message || fallbackMessage
  );

  normalizedError.name = error?.name || "StripeError";
  normalizedError.code = error?.code || fallbackCode;
  normalizedError.statusCode = error?.statusCode || error?.raw?.statusCode || 502;
  normalizedError.details = error?.raw || null;

  return normalizedError;
};

export function ensureStripeReady() {
  if (!stripe) {
    const error = new Error("Stripe is not configured");
    error.statusCode = 500;
    error.code = "STRIPE_NOT_CONFIGURED";
    throw error;
  }
}

export function resolveCountryConfig(country) {
  const normalizedCountry = String(country || "").trim().toUpperCase();

  if (normalizedCountry === "IN" || normalizedCountry === "INDIA") {
    return COUNTRY_PAYMENT_CONFIG.IN;
  }

  if (normalizedCountry === "KW" || normalizedCountry === "KUWAIT") {
    return COUNTRY_PAYMENT_CONFIG.KW;
  }

  return COUNTRY_PAYMENT_CONFIG.DEFAULT;
}

export function convertToMinorUnits(amount, country) {
  const config = resolveCountryConfig(country);
  const numericAmount = Number(amount) || 0;
  return Math.round(numericAmount * config.minorUnitMultiplier);
}

export async function createCheckoutSession({
  orderId,
  title,
  amount,
  country,
  customerEmail,
  successUrl,
  cancelUrl,
  idempotencyKey,
}) {
  ensureStripeReady();

  const config = resolveCountryConfig(country);
  const unitAmount = convertToMinorUnits(amount, country);

  if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
    const error = new Error("Order amount must be greater than 0");
    error.statusCode = 400;
    error.code = "INVALID_PAYMENT_AMOUNT";
    throw error;
  }

  try {
    console.log("[STRIPE] Creating checkout session", {
      orderId,
      country,
      currency: config.currency,
      amount,
      unitAmount,
    });

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: config.payment_method_types,
        mode: "payment",
        customer_email: customerEmail || undefined,
        success_url: successUrl,
        cancel_url: cancelUrl,
        payment_intent_data: {
          metadata: {
            orderId: String(orderId),
            country: String(country || ""),
          },
        },
        line_items: [
          {
            price_data: {
              currency: config.currency,
              product_data: {
                name: title,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          orderId: String(orderId),
          country: String(country || ""),
        },
      },
      idempotencyKey ? { idempotencyKey } : undefined
    );

    console.log("[STRIPE] Checkout session created", {
      orderId,
      sessionId: session.id,
    });

    return {
      session,
      currency: config.currency,
      paymentMethodTypes: config.payment_method_types,
    };
  } catch (error) {
    throw normalizeStripeError(
      error,
      "Failed to create Stripe checkout session",
      "STRIPE_CHECKOUT_SESSION_CREATE_FAILED"
    );
  }
}

export async function retrieveCheckoutSession(sessionId) {
  ensureStripeReady();

  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    throw normalizeStripeError(
      error,
      "Failed to retrieve Stripe checkout session",
      "STRIPE_CHECKOUT_SESSION_FETCH_FAILED"
    );
  }
}

export function constructWebhookEvent(payload, signature) {
  ensureStripeReady();

  if (!STRIPE_WEBHOOK_SECRET) {
    const error = new Error("Stripe webhook secret is not configured");
    error.statusCode = 500;
    error.code = "STRIPE_WEBHOOK_NOT_CONFIGURED";
    throw error;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    throw normalizeStripeError(
      error,
      "Invalid Stripe webhook signature",
      "STRIPE_WEBHOOK_SIGNATURE_INVALID"
    );
  }
}

export function getStripeClientConfig() {
  return {
    publishableKey:
      process.env.STRIPE_PUBLISHABLE_KEY ||
      process.env.Stripe_Publishable_key ||
      process.env.Publishable_key ||
      null,
    configured: Boolean(stripe),
  };
}

export default {
  ensureStripeReady,
  resolveCountryConfig,
  convertToMinorUnits,
  createCheckoutSession,
  retrieveCheckoutSession,
  constructWebhookEvent,
  getStripeClientConfig,
};
