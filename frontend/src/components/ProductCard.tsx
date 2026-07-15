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
      whileHover={{ y: -8 }}
      className="group overflow-hidden rounded-2xl bg-white shadow-soft transition-all duration-300 hover:shadow-lg"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden bg-gray-100">
          <img
            src={firstImage}
            alt={product.title}
            className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(productId);
            }}
            className="absolute right-5 top-5 rounded-full bg-white/95 backdrop-blur-sm p-2 shadow-sm transition hover:scale-110 hover:shadow-md"
            aria-label="Toggle wishlist"
          >
            <Heart
              size={18}
              className={isWished ? "text-blue-600" : "text-gray-300"}
              fill={isWished ? "currentColor" : "none"}
            />
          </button>

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <span className="rounded-full bg-white px-6 py-2 text-xs font-semibold uppercase tracking-wider text-gray-900">
                Sold Out
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3 p-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-gray-400">{product.category}</p>
            <h3 className="line-clamp-2 text-base font-display font-semibold text-gray-900">{product.title}</h3>
          </div>

          <p className="text-lg font-semibold text-blue-600">{formatKwd(product.price)}</p>

          {!outOfStock && (
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                className="rounded-full border-2 border-blue-600 bg-white px-4 py-2.5 text-xs font-semibold text-blue-600 transition duration-300 hover:bg-blue-50 active:bg-blue-100"
              >
                Add
              </button>
              <button
                onClick={handleBuyNow}
                className="rounded-full bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition duration-300 hover:bg-blue-700 active:bg-blue-800"
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
