import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Package } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get("order") || "—";

  return (
    <div className="container py-28 text-center">

      {/* Animated Success Badge */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-12"
      >
        <div className="relative w-28 h-28 mx-auto">
          <div className="absolute inset-0 rounded-full bg-black/10 animate-pulse" />
          <div className="relative w-full h-full rounded-full bg-black flex items-center justify-center shadow-xl">
            <CheckCircle size={52} className="text-white" />
          </div>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-display text-4xl mb-4"
      >
        Order Successfully Placed
      </motion.h1>

      {/* Order Reference */}
      <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
        Order Reference
      </p>

      <p className="font-display text-2xl tracking-wide mb-12">
        #{orderId}
      </p>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto border border-border rounded-2xl p-10 mb-14 text-left space-y-6"
      >
        <div className="flex items-start gap-4">
          <Package className="mt-1 text-foreground" size={20} />
          <div>
            <p className="font-medium mb-1">Order Processing</p>
            <p className="text-sm text-muted-foreground">
              Your order is now being prepared. Every item is carefully
              inspected before dispatch.
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            You will receive updates via WhatsApp and email once your order
            is shipped.
          </p>
        </div>

        <div>
          <p className="text-sm">
            Estimated processing time:{" "}
            <span className="font-medium">
              1–2 business days
            </span>
          </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center">

        <Link
          to="/my-orders"
          className="border border-border px-12 py-3 rounded-full text-sm uppercase tracking-wider hover:border-foreground hover:text-foreground transition"
        >
          View My Orders
        </Link>

        <Link
          to="/shop"
          className="bg-black text-white px-12 py-3 rounded-full text-sm uppercase tracking-wider inline-flex items-center justify-center gap-3 hover:bg-charcoal transition"
        >
          Continue Shopping
          <ArrowRight size={16} />
        </Link>

      </div>

      {/* Trust Footer */}
      <div className="mt-16 text-xs text-muted-foreground tracking-wide">
        Secure Payment • Authentic Products • Reliable Delivery
      </div>

    </div>
  );
}
