"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@workspace/ui/lib/utils";

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    imageUrl?: string;
    sku: string;
    optionValues: Record<string, string>;
    discountValue: number;
    compareAtPrice?: number;
  };
  activeVariantId: string | null;
  selectedOptions: Record<string, string>;
  stock: number;
  className?: string;
  disabled?: boolean;
  disabledText?: string;
}

export function AddToCartButton({ 
  product, 
  activeVariantId, 
  selectedOptions, 
  stock, 
  className,
  disabled,
  disabledText = "Out of Stock"
}: AddToCartButtonProps) {
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const cartItemId = activeVariantId ? `${product.id}-${activeVariantId}` : product.id;
  const cartItem = cartItems.find((item) => item.id === cartItemId);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addItem({
      id: cartItemId,
      productId: product.id,
      variantId: activeVariantId,
      productName: product.title,
      productSlug: product.slug,
      sku: product.sku,
      image: product.imageUrl,
      optionValues: selectedOptions,
      quantity: 1,
      unitPrice: product.price,
      discountValue: product.discountValue,
      compareAtPrice: product.compareAtPrice,
    });
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      updateQuantity(cartItemId, quantity - 1);
    } else {
      removeItem(cartItemId);
    }
  };

  const handleIncrease = () => {
    if (stock === undefined || quantity < stock) {
      updateQuantity(cartItemId, quantity + 1);
    }
  };

  if (stock === 0 || disabled) {
    return (
      <Button disabled className={cn("w-full bg-secondary/50 text-muted-foreground cursor-not-allowed rounded-full h-12 text-sm font-medium tracking-widest uppercase", className)}>
        {disabledText}
      </Button>
    );
  }

  return (
    <div className={cn("w-full flex items-center justify-center", className)}>
      {quantity === 0 ? (
        <Button
          className="w-full bg-foreground text-background hover:bg-foreground/90 transition-all rounded-full h-12 font-medium uppercase tracking-[0.15em] flex items-center justify-center gap-3 overflow-hidden group"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" />
          <span className="group-hover:translate-x-1 transition-transform duration-300">Add to Bag</span>
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, borderRadius: "2rem" }}
          animate={{ opacity: 1, scale: 1, borderRadius: "2rem" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex items-center justify-between border border-border/50 px-2 py-1 w-full bg-background/50 backdrop-blur-sm h-12"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-secondary transition-colors text-foreground"
            onClick={handleDecrease}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <span className="text-base font-medium w-12 text-center text-foreground">{quantity}</span>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-secondary transition-colors text-foreground"
            onClick={handleIncrease}
            disabled={stock !== undefined && quantity >= stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
