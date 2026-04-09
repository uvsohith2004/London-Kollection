import { useState } from "react";
import api from "@/services/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatKwd } from "@/lib/currency";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!orderId) {
      toast.error("Enter Order ID");
      return;
    }

    try {
      setLoading(true);
      const res = await api.getOrder(orderId);
      setOrder(res.order);
    } catch (err: any) {
      toast.error("Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-20">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-3xl font-display"
      >
        Track Your Order
      </motion.h1>

      <div className="mb-10 flex gap-4">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter Order ID"
          className="flex-1 rounded-xl border border-border px-4 py-3"
        />

        <button onClick={handleTrack} className="rounded-xl bg-black px-8 py-3 text-white">
          {loading ? "Tracking..." : "Track"}
        </button>
      </div>

      {order && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 rounded-2xl border border-border p-8"
        >
          <div>
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-semibold">{order._id || order.id}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Payment Status</p>
            <p className="capitalize">{order.paymentStatus}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Order Status</p>
            <p className="capitalize">{order.orderStatus}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p>{formatKwd(order.totalPrice)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Shipping Address</p>
            <p>{order.shippingAddress?.address}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
