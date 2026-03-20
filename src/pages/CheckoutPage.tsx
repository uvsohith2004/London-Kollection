import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useLocation, useNavigate, Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";
import api from "@/services/api";
import { formatKwd } from "@/lib/currency";

const WHATSAPP_NUMBER = "96599999999";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function isValidMongoDBObjectId(id: string): boolean {
  return /^[0-9a-f]{24}$/i.test(id || "");
}

async function loadRazorpayCheckout() {
  if (window.Razorpay) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const buyNowItem = location.state?.product
    ? {
        productId: location.state.product._id || location.state.product.id,
        title: location.state.product.title,
        price: location.state.product.price,
        quantity: location.state.quantity || 1,
        image: location.state.product.images?.[0] || "",
      }
    : null;

  const checkoutItems = useMemo(() => (buyNowItem ? [buyNowItem] : items), [buyNowItem, items]);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "India",
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
          country: userProfile.country || "India",
          postalCode: userProfile.postalCode || "",
        }));
      } catch (error) {
        console.error("Profile fetch failed", error);
      }
    };

    loadProfile();
  }, [user]);

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = checkoutItems.length > 0 ? 1 : 0;
  const total = subtotal + deliveryFee;

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

    toast.success("Order placed successfully");
    navigate(`/order-success?order=${orderId}`);
  };

  const handleOnlinePayment = async (response: any) => {
    const scriptLoaded = await loadRazorpayCheckout();

    if (!scriptLoaded || !window.Razorpay) {
      throw new Error("Razorpay checkout failed to load");
    }

    const options = {
      key: response.payment.key,
      amount: response.payment.amount,
      currency: response.payment.currency,
      order_id: response.payment.orderId,
      name: "London Collection",
      description: "Secure order payment",
      prefill: {
        name: form.name,
        email: user?.email || "",
        contact: form.phone,
      },
      notes: {
        address: `${form.address}, ${form.city}`,
      },
      handler: async (paymentResponse: any) => {
        try {
          const verifyResponse = await api.verifyPayment({
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
          });

          if (!buyNowItem) {
            clearCart();
          }

          toast.success("Payment completed successfully");
          navigate(`/order-success?order=${verifyResponse.data.orderId}`);
        } catch (error: any) {
          toast.error(error.message || "Payment verification failed");
        }
      },
      modal: {
        ondismiss: async () => {
          try {
            await api.reportPaymentFailure({
              razorpay_order_id: response.payment.orderId,
              error_description: "Customer closed Razorpay checkout",
              error_reason: "checkout_dismissed",
            });
          } catch (error) {
            console.error("Payment dismissal report failed", error);
          }
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", async (failureResponse: any) => {
      try {
        await api.reportPaymentFailure({
          razorpay_order_id: response.payment.orderId,
          razorpay_payment_id: failureResponse.error?.metadata?.payment_id,
          error_description: failureResponse.error?.description,
          error_reason: failureResponse.error?.reason,
        });
      } catch (error) {
        console.error("Payment failure report failed", error);
      }

      toast.error(failureResponse.error?.description || "Payment failed");
    });

    razorpay.open();
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
        shippingAddress: {
          name: form.name,
          email: user.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: "",
          pincode: form.postalCode,
          country: form.country || "India",
        },
        notes: form.notes,
      });

      if (response.paymentRequired && response.payment) {
        await handleOnlinePayment(response);
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
                { value: "online", label: "Pay Online with Razorpay" },
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

          <button
            type="submit"
            disabled={loading}
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-4 text-sm text-white transition hover:bg-gray-800"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Processing..." : "Place Order"}
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
    </div>
  );
}
