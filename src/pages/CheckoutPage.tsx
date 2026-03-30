import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useLocation, useNavigate, Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import api from "@/services/api";
import { formatKwd } from "@/lib/currency";

const WHATSAPP_NUMBER = "9885058098";
const CHECKOUT_SNAPSHOT_KEY = "lc-checkout-snapshot";

type PendingPayment = {
  orderId: string;
  clientSecret: string;
  publishableKey: string;
  paymentIntentId: string;
  displayCurrency: string;
  displayAmount: number;
};

type CheckoutSnapshot = {
  items: Array<{
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }>;
};

function isValidMongoDBObjectId(id: string): boolean {
  return /^[0-9a-f]{24}$/i.test(id || "");
}

function normalizeContactNumber(contact: string) {
  const digitsOnly = String(contact || "").replace(/\D/g, "");

  if (!digitsOnly) {
    return "";
  }

  if (digitsOnly.startsWith("91") && digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  }

  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }

  return contact.startsWith("+") ? contact : `+${digitsOnly}`;
}

function formatAmountByCurrency(amount: number, currency: string) {
  const upperCurrency = String(currency || "KWD").toUpperCase();
  const locale = "en-KW";
  const fractionDigits = 3;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: upperCurrency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(amount || 0));
}

async function pause(ms: number) {
  await new Promise((resolve) => window.setTimeout(resolve, ms));
}

function readCheckoutSnapshot(): CheckoutSnapshot | null {
  try {
    const rawValue = window.sessionStorage.getItem(CHECKOUT_SNAPSHOT_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue?.items)) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

function writeCheckoutSnapshot(snapshot: CheckoutSnapshot | null) {
  try {
    if (!snapshot) {
      window.sessionStorage.removeItem(CHECKOUT_SNAPSHOT_KEY);
      return;
    }

    window.sessionStorage.setItem(CHECKOUT_SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage errors to avoid blocking checkout.
  }
}

function StripePaymentForm({
  pendingPayment,
  customerEmail,
  onConfirmSuccess,
  onCancel,
}: {
  pendingPayment: PendingPayment;
  customerEmail: string;
  onConfirmSuccess: (paymentIntentId: string) => Promise<void>;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [confirming, setConfirming] = useState(false);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe checkout is still loading. Please wait a moment.");
      return;
    }

    try {
      setConfirming(true);

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          receipt_email: customerEmail || undefined,
        },
      });

      if (error) {
        await api.reportPaymentFailure({
          paymentIntentId: pendingPayment.paymentIntentId,
          error_description: error.message,
          error_reason: error.type,
        });

        throw new Error(error.message || "Payment failed. Please try again.");
      }

      if (!paymentIntent?.id) {
        throw new Error("Stripe did not return a payment reference.");
      }

      await onConfirmSuccess(paymentIntent.id);
    } catch (error: any) {
      toast.error(error.message || "Payment confirmation failed");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8">
      <div className="mb-6">
        <h2 className="text-xl font-display">Complete Payment</h2>
        <p className="mt-2 text-sm text-gray-500">
          Pay {formatAmountByCurrency(pendingPayment.displayAmount, pendingPayment.displayCurrency)} securely with card.
        </p>
      </div>

      <form onSubmit={handlePaymentSubmit} className="space-y-6">
        <PaymentElement />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={confirming || !stripe || !elements}
            className="flex-1 rounded-xl bg-black py-4 text-sm text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {confirming
              ? "Confirming Payment..."
              : `Pay ${formatAmountByCurrency(pendingPayment.displayAmount, pendingPayment.displayCurrency)}`}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="rounded-xl border border-gray-300 px-6 py-4 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [checkoutSnapshot, setCheckoutSnapshot] = useState<CheckoutSnapshot | null>(() => readCheckoutSnapshot());

  const buyNowItem = useMemo(
    () =>
      location.state?.product
        ? {
            productId: location.state.product._id || location.state.product.id,
            title: location.state.product.title,
            price: location.state.product.price,
            quantity: location.state.quantity || 1,
            image: location.state.product.images?.[0] || "",
          }
        : null,
    [location.state]
  );

  const sourceCheckoutItems = useMemo(() => (buyNowItem ? [buyNowItem] : items), [buyNowItem, items]);

  const checkoutItems = useMemo(() => {
    if (sourceCheckoutItems.length > 0) {
      return sourceCheckoutItems;
    }

    return checkoutSnapshot?.items || [];
  }, [sourceCheckoutItems, checkoutSnapshot]);

  const [loading, setLoading] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "Kuwait",
    postalCode: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("online");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const res = await api.getProfile();
        const userProfile = res.data.user;

        setForm((prev) => ({
          ...prev,
          name: userProfile.name || "",
          phone: userProfile.phone || "",
          address: userProfile.address || "",
          city: userProfile.city || "",
          country: userProfile.country || "Kuwait",
          postalCode: userProfile.postalCode || "",
        }));
      } catch (error) {
        console.error("Profile fetch failed", error);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    if (sourceCheckoutItems.length > 0) {
      const nextSnapshot = { items: sourceCheckoutItems };
      setCheckoutSnapshot(nextSnapshot);
      writeCheckoutSnapshot(nextSnapshot);
    } else if (!pendingPayment) {
      const storedSnapshot = readCheckoutSnapshot();
      setCheckoutSnapshot(storedSnapshot);

      if (!storedSnapshot?.items?.length) {
        writeCheckoutSnapshot(null);
      }
    }
  }, [sourceCheckoutItems, pendingPayment]);

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = checkoutItems.length > 0 ? 1 : 0;
  const total = subtotal + deliveryFee;
  const estimatedOnlineTotal = total;

  const stripePromise = useMemo(() => {
    if (!pendingPayment?.publishableKey) {
      return null;
    }

    return loadStripe(pendingPayment.publishableKey);
  }, [pendingPayment?.publishableKey]);

  const stripeOptions = useMemo<StripeElementsOptions | undefined>(() => {
    if (!pendingPayment?.clientSecret) {
      return undefined;
    }

    return {
      clientSecret: pendingPayment.clientSecret,
      appearance: {
        theme: "stripe",
      },
    };
  }, [pendingPayment?.clientSecret]);

  if (checkoutItems.length === 0) {
    return (
      <div className="container py-32 text-center">
        <h2 className="mb-4 text-2xl font-display">Your checkout is empty</h2>
        <Link to="/shop" className="underline text-sm">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCashOnDeliverySuccess = (orderId: string) => {
    if (!buyNowItem) {
      clearCart();
    }

    setCheckoutSnapshot(null);
    writeCheckoutSnapshot(null);
    toast.success("Order placed successfully");
    navigate(`/order-success?order=${orderId}`);
  };

  const waitForWebhookVerification = async (paymentIntentId: string, fallbackOrderId: string) => {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const verifyResponse = await api.verifyPayment({
        paymentIntentId,
      });

      if (verifyResponse?.data?.paymentStatus === "paid") {
        return verifyResponse.data.orderId || fallbackOrderId;
      }

      await pause(1500);
    }

    throw new Error("Payment was submitted, but confirmation is still pending. Please check your orders shortly.");
  };

  const handleStripePaymentReady = (response: any) => {
    const orderId = response?.order?.id || response?.order?._id;
    const clientSecret = response?.payment?.clientSecret;
    const publishableKey = response?.payment?.publishableKey;
    const paymentIntentId = response?.payment?.paymentIntentId;

    if (!orderId || !clientSecret || !publishableKey || !paymentIntentId) {
      throw new Error("Invalid Stripe payment configuration received from server");
    }

    setPendingPayment({
      orderId,
      clientSecret,
      publishableKey,
      paymentIntentId,
      displayCurrency: response.payment.displayCurrency || response.payment.currency || "KWD",
      displayAmount: Number(response.payment.displayAmount || response.payment.amount || 0),
    });
  };

  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    if (!pendingPayment) {
      throw new Error("Payment state is missing");
    }

    const orderId = await waitForWebhookVerification(paymentIntentId, pendingPayment.orderId);
    setPendingPayment(null);

    if (!buyNowItem) {
      clearCart();
    }

    setCheckoutSnapshot(null);
    writeCheckoutSnapshot(null);
    toast.success("Payment completed successfully");
    navigate(`/order-success?order=${orderId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.address || !form.city) {
      toast.error("Please complete the required fields");
      return;
    }

    const invalidItems = checkoutItems.filter((item) => !isValidMongoDBObjectId(item.productId));
    if (invalidItems.length > 0) {
      toast.error("One or more products are invalid. Please refresh and try again.");
      return;
    }

    if (!user) {
      toast.error("Please log in first.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await api.createOrder({
        products: checkoutItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod,
        region: "kuwait",
        shippingAddress: {
          name: form.name,
          email: user.email,
          phone: normalizeContactNumber(form.phone),
          address: form.address,
          city: form.city,
          state: "",
          pincode: form.postalCode,
          country: form.country || "Kuwait",
        },
        notes: form.notes,
      });

      if (response.paymentRequired && response.payment) {
        handleStripePaymentReady(response);
      } else {
        handleCashOnDeliverySuccess(response.order.id || response.order._id);
      }
    } catch (err: any) {
      toast.error(err.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  const waMsg = encodeURIComponent(
    `Hello,\nOrder Details:\n\n${checkoutItems
      .map((i) => `${i.title} x${i.quantity} = ${formatKwd(i.price * i.quantity)}`)
      .join("\n")}\n\nTotal: ${formatKwd(total)}`
  );

  return (
    <div className="container py-20">
      <h1 className="mb-14 text-4xl font-display">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-16 lg:grid-cols-3">
        <div className="space-y-16 lg:col-span-2">
          <div>
            <h2 className="mb-8 text-xl font-display">Shipping Information</h2>

            <div className="grid gap-6 md:grid-cols-2">
              <input name="name" placeholder="Full Name" value={form.name} onChange={onChange} className="input-field" />
              <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} className="input-field" />
              <input
                name="address"
                placeholder="Full Address"
                value={form.address}
                onChange={onChange}
                className="input-field md:col-span-2"
              />
              <input name="city" placeholder="City" value={form.city} onChange={onChange} className="input-field" />
              <input
                name="postalCode"
                placeholder="Postal Code"
                value={form.postalCode}
                onChange={onChange}
                className="input-field"
              />
              <input
                name="country"
                placeholder="Country"
                value={form.country}
                onChange={onChange}
                className="input-field md:col-span-2"
              />
            </div>

            <textarea
              name="notes"
              placeholder="Order notes (optional)"
              value={form.notes}
              onChange={onChange}
              rows={3}
              className="input-field mt-6"
            />
          </div>

          <div>
            <h2 className="mb-8 text-xl font-display">Payment Method</h2>

            <div className="space-y-4">
              {[
                { value: "online", label: "Pay Online with Stripe" },
                { value: "cod", label: "Cash on Delivery" },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-6 py-5 transition ${
                    paymentMethod === method.value ? "border-black bg-gray-50" : "border-gray-300"
                  }`}
                >
                  <span className="text-sm font-body">{method.label}</span>

                  <input
                    type="radio"
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value as "cod" | "online")}
                    className="accent-black"
                  />
                </label>
              ))}
            </div>
          </div>

        </div>

        <div className="sticky top-24 h-fit rounded-3xl border border-gray-200 p-10">
          <h2 className="mb-8 text-xl font-display">Order Summary</h2>

          <div className="mb-8 space-y-4 text-sm font-body">
            {checkoutItems.map((item) => (
              <div key={item.productId} className="flex justify-between gap-4">
                <span className="text-gray-600">
                  {item.title} x{item.quantity}
                </span>
                <span>{formatKwd(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t pt-6 text-sm font-body">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatKwd(subtotal)}</span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>Delivery</span>
              <span>{formatKwd(deliveryFee)}</span>
            </div>

            <div className="mt-4 flex justify-between text-lg font-display">
              <span>Total</span>
              <span>{formatKwd(total)}</span>
            </div>
          </div>

          {paymentMethod === "online" && (
            <p className="mt-4 text-xs leading-5 text-gray-500">
              You will pay {formatKwd(estimatedOnlineTotal)}. Currency conversion is handled in the background.
            </p>
          )}

          <button
            type="submit"
            disabled={loading || Boolean(pendingPayment)}
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 text-sm text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Processing..." : pendingPayment ? "Complete Payment Below" : "Place Order"}
          </button>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full rounded-xl border border-black py-3 text-center text-sm transition hover:bg-black hover:text-white"
          >
            <MessageCircle size={16} className="mr-2 inline" />
            Order via WhatsApp
          </a>
        </div>
      </form>

      {pendingPayment && stripePromise && stripeOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-4 sm:p-6">
            <Elements stripe={stripePromise} options={stripeOptions}>
              <StripePaymentForm
                pendingPayment={pendingPayment}
                customerEmail={user?.email || ""}
                onConfirmSuccess={handleStripePaymentSuccess}
                onCancel={() => setPendingPayment(null)}
              />
            </Elements>
          </div>
        </div>
      )}
    </div>
  );
}
