import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    deliveryFee,
    total,
  } = useCartStore();

  /* ================= EMPTY STATE ================= */

  if (items.length === 0) {
    return (
      <div className="container py-28 text-center">
        <ShoppingBag
          className="mx-auto mb-6 text-muted-foreground"
          size={54}
        />

        <h1 className="font-display text-3xl mb-3">
          Your Cart Awaits
        </h1>

        <p className="text-muted-foreground font-body text-sm mb-8">
          Discover timeless pieces crafted to elevate your style.
        </p>

        <Link
          to="/shop"
          className="bg-black text-white font-body text-sm uppercase tracking-wider px-10 py-3 rounded-full inline-flex items-center gap-3 hover:bg-charcoal transition"
        >
          Explore Collection <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  /* ================= CART ================= */

  return (
    <div className="container py-16">

      <h1 className="font-display text-4xl mb-12">
        Shopping Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-14">

        {/* ================= ITEMS ================= */}
        <div className="lg:col-span-2 space-y-6">

          {items.map((item, i) => (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-6 bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-28 h-28 object-cover rounded-xl"
              />

              <div className="flex-1">

                <h3 className="font-body text-base md:text-lg mb-1">
                  {item.title}
                </h3>

                <p className="text-muted-foreground text-sm mb-4">
                  {item.price.toFixed(3)} KWD
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4">

                  <div className="flex items-center border border-border rounded-full overflow-hidden">

                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="px-4 py-2 text-muted-foreground hover:text-foreground transition"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="px-4 text-sm font-medium">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="px-4 py-2 text-muted-foreground hover:text-foreground transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>
              </div>

              {/* Item Total */}
              <div className="font-display text-lg whitespace-nowrap">
                {(item.price * item.quantity).toFixed(3)} KWD
              </div>
            </motion.div>
          ))}

        </div>

        {/* ================= SUMMARY ================= */}
        <div className="bg-card rounded-2xl p-8 shadow-sm h-fit sticky top-24">

          <h2 className="font-display text-xl mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 text-sm font-body">

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Subtotal
              </span>
              <span>
                {subtotal().toFixed(3)} KWD
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Delivery
              </span>
              <span>
                {deliveryFee().toFixed(3)} KWD
              </span>
            </div>

            <div className="border-t border-border pt-5 flex justify-between font-display text-lg">
              <span>Total</span>
              <span>
                {total().toFixed(3)} KWD
              </span>
            </div>

          </div>

          <Link
            to="/checkout"
            className="mt-8 bg-black text-white font-body text-sm uppercase tracking-wider px-10 py-3 rounded-full w-full inline-flex items-center justify-center gap-3 hover:bg-charcoal transition"
          >
            Proceed to Checkout <ArrowRight size={16} />
          </Link>

          <p className="text-xs text-muted-foreground text-center mt-5">
            Secure checkout. Fast delivery. Trusted quality.
          </p>

        </div>
      </div>
    </div>
  );
}