import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatKwd } from "@/lib/currency";

export default function ProductCard({ product }: { product: any }) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();
  const navigate = useNavigate();

  const productId = product._id || product.id;
  const isWished = has(productId);
  const outOfStock = product.stock === 0;

  const firstImage =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock) return;

    addItem({
      productId,
      title: product.title,
      price: product.price,
      image: firstImage,
    });

    toast.success(`${product.title} added to cart`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock) return;

    navigate("/checkout", {
      state: {
        product,
        quantity: 1,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-stone-100">
          <img
            src={firstImage}
            alt={product.title}
            className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(productId);
            }}
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow transition hover:scale-110"
            aria-label="Toggle wishlist"
          >
            <Heart
              size={16}
              className={isWished ? "text-black" : "text-gray-400"}
              fill={isWished ? "currentColor" : "none"}
            />
          </button>

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400">{product.category}</p>
            <h3 className="line-clamp-1 text-base font-semibold text-stone-900">{product.title}</h3>
          </div>

          <p className="text-lg font-semibold text-black">{formatKwd(product.price)}</p>

          {!outOfStock && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="rounded border border-black bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-100"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="rounded bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Buy Now
              </button>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
