import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "@/services/api";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatKwd } from "@/lib/currency";

function formatOrderDate(date: string) {
  return new Intl.DateTimeFormat("en-KW", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function statusClasses(status: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "paid" || normalized === "delivered") return "bg-emerald-100 text-emerald-700";
  if (normalized === "processing" || normalized === "pending") return "bg-amber-100 text-amber-700";
  if (normalized === "failed" || normalized === "cancelled") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

export default function OrderHistoryPage() {
  const location = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.getMyOrders();
        setOrders(res.orders || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
        <h1 className="mb-3 font-display text-4xl">My Orders</h1>
        <p className="text-sm text-muted-foreground">Review your recent purchases and live status updates.</p>
      </motion.div>

      <div className="grid gap-16 lg:grid-cols-3">
        <div>
          <div className="sticky top-28 rounded-2xl border border-border p-6">
            <h2 className="mb-6 font-display text-lg">Account</h2>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to="/profile"
                  className={`block transition ${
                    location.pathname === "/profile"
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/my-orders"
                  className={`block transition ${
                    location.pathname === "/my-orders"
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={32} className="animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-20 text-center text-muted-foreground">
              No orders yet.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id || order.id} className="rounded-3xl border border-border bg-white p-8 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Order ID</p>
                    <p className="font-semibold">#{(order._id || order.id)?.slice(-8)}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Placed on: {formatOrderDate(order.createdAt)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(order.paymentStatus)}`}>
                      Payment {order.paymentStatus}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="mb-3 text-sm font-semibold text-stone-900">Products</p>
                  <div className="space-y-3">
                    {(order.products || []).map((product: any) => (
                      <div key={product.productId || product._id} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                        <div>
                          <p className="font-medium text-stone-900">{product.title}</p>
                          <p className="text-sm text-muted-foreground">Qty: {product.quantity}</p>
                        </div>
                        <p className="font-medium">{formatKwd(product.price * product.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-5">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="capitalize">{order.paymentMethod || "cod"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <p className="text-lg font-semibold">{formatKwd(order.totalPrice)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
