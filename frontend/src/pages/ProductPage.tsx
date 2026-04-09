import { useParams, Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useProductStore } from "@/store/productStore";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  MessageCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatKwd } from "@/lib/currency";

const WHATSAPP_NUMBER = "96599999999";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getProductById } = useProductStore();
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, has } = useWishlistStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const foundProduct = await getProductById(slug);
        setProduct(foundProduct || null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, getProductById]);

  if (loading) {
    return (
      <div className="container py-28 text-center">
        <Loader2 className="mx-auto animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-28 text-center">
        <p className="mb-4 text-muted-foreground">Product not found.</p>
        <Link to="/shop" className="underline text-sm">
          Back to shop
        </Link>
      </div>
    );
  }

  const productId = product._id || product.id;
  const isWished = has(productId);
  const outOfStock = product.stock === 0;
  const currentImage =
    product.images?.[selectedImg] ||
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900";

  const handleAdd = () => {
    addItem(
      {
        productId,
        title: product.title,
        price: product.price,
        image: product.images?.[0] || currentImage,
      },
      qty
    );
    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        product,
        quantity: qty,
      },
    });
  };

  const waMsg = encodeURIComponent(
    `Hello,\nI want to order:\n\nProduct: ${product.title}\nQuantity: ${qty}\nTotal: ${formatKwd(product.price * qty)}`
  );

  return (
    <div className="container pb-20 pt-32">
      <button
        onClick={() => navigate(-1)}
        className="mb-12 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid gap-20 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-5 aspect-square overflow-hidden rounded-3xl bg-card">
            <img src={currentImage} alt={product.title} className="h-full w-full object-cover" />
          </div>

          {product.images?.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`h-20 w-20 overflow-hidden rounded-xl border transition ${
                    i === selectedImg ? "border-foreground" : "border-border"
                  }`}
                >
                  <img src={img} alt={`${product.title} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}>
          <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">{product.category}</p>
          <h1 className="mb-5 font-display text-4xl">{product.title}</h1>
          <p className="mb-6 text-2xl font-semibold">{formatKwd(product.price)}</p>
          <p className="mb-10 leading-relaxed text-muted-foreground">{product.description}</p>

          {!outOfStock && (
            <>
              <div className="mb-8 flex items-center gap-6">
                <div className="flex items-center rounded-xl border border-border">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-3 text-muted-foreground hover:text-foreground"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="px-4 py-3 text-muted-foreground hover:text-foreground"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">{product.stock} available</span>
              </div>

              <div className="mb-10 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleAdd}
                  className="flex-1 rounded-full border border-foreground py-4 text-sm uppercase tracking-wider transition hover:bg-stone-100"
                >
                  <ShoppingBag size={16} className="mr-2 inline" />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 rounded-full bg-foreground py-4 text-sm uppercase tracking-wider text-background transition hover:opacity-90"
                >
                  Buy Now
                </button>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-full border border-foreground py-4 text-center text-sm uppercase tracking-wider transition hover:bg-foreground hover:text-background"
                >
                  <MessageCircle size={16} className="mr-2 inline" />
                  WhatsApp
                </a>
              </div>
            </>
          )}

          <div className="space-y-3 border-t border-border pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} />
              Secure checkout
            </div>
            <div className="flex items-center gap-3">
              <Truck size={16} />
              Kuwait-wide delivery
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw size={16} />
              Easy order support
            </div>
          </div>

          <button
            onClick={() => toggle(productId)}
            className="mt-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Heart size={16} fill={isWished ? "currentColor" : "none"} />
            {isWished ? "Remove from Wishlist" : "Add to Wishlist"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
