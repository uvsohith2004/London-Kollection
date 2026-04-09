import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle, Package, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order") || "—";

  return (
    <div className="container py-20">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2rem] border border-gray-200 bg-gradient-to-br from-stone-50 via-white to-stone-100"
        >
          <div className="grid gap-10 p-8 md:grid-cols-[1.15fr_0.85fr] md:p-12">
            <div>
              <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-black px-5 py-2 text-xs uppercase tracking-[0.28em] text-white">
                <CheckCircle size={16} />
                Payment Successful
              </div>

              <h1 className="max-w-xl text-4xl font-display leading-tight text-black md:text-5xl">
                Your order is confirmed and you can keep shopping.
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
                Your payment was received successfully and your order is now in processing.
                You can continue browsing and place more orders anytime.
              </p>

              <div className="mt-8 rounded-3xl border border-gray-200 bg-white/80 p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Order Reference</p>
                <p className="mt-3 break-all font-display text-2xl text-black">#{orderId}</p>
                <p className="mt-3 text-sm text-gray-600">
                  We will update you by email or WhatsApp once this order moves to the next stage.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-black px-8 py-4 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-gray-800"
                >
                  Buy More Products
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/my-orders"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-gray-300 px-8 py-4 text-sm uppercase tracking-[0.2em] text-gray-800 transition hover:border-black hover:text-black"
                >
                  View My Orders
                  <Package size={16} />
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-black">
                <ShoppingBag size={24} />
              </div>

              <h2 className="mt-6 text-2xl font-display text-black">What happens next</h2>

              <div className="mt-8 space-y-6 text-sm leading-6 text-gray-600">
                <div>
                  <p className="font-medium text-black">1. Payment completed</p>
                  <p>Your order has been accepted and saved to your account.</p>
                </div>

                <div>
                  <p className="font-medium text-black">2. Order processing</p>
                  <p>Our team now prepares your items and checks them before dispatch.</p>
                </div>

                <div>
                  <p className="font-medium text-black">3. Keep shopping</p>
                  <p>You can safely continue shopping right away and place another order if you want.</p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-stone-50 p-5 text-xs uppercase tracking-[0.22em] text-gray-500">
                Secure payment • Authentic products • Reliable delivery
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
