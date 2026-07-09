"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useCartQuery } from "@/app/[locale]/cart/queries";
import { useAddToCartMutation, useUpdateCartItemMutation, useRemoveCartItemMutation } from "@/app/[locale]/cart/mutations";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { useState, useEffect } from "react";

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
  const { data: cartSummary, isLoading } = useCartQuery();
  const { mutate: addToCart, isPending: isAdding } = useAddToCartMutation();
  const { mutate: updateCartItem } = useUpdateCartItemMutation();
  const { mutate: removeCartItem } = useRemoveCartItemMutation();

  const cartItem = cartSummary?.items?.find(
    (item) => item.productId === product.id && item.variantId === activeVariantId
  );
  
  const serverQuantity = cartItem?.quantity || 0;
  
  // Local optimistic state for instant UI updates
  const [localQuantity, setLocalQuantity] = useState(serverQuantity);

  // Sync local state if server state changes (e.g. from cart page or another tab)
  useEffect(() => {
    setLocalQuantity(serverQuantity);
  }, [serverQuantity]);

  // Debounced API call for quantity updates
  const debouncedUpdateQuantity = useDebounceCallback((itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeCartItem(itemId);
    } else {
      updateCartItem({ itemId, quantity: newQuantity });
    }
  }, 400);

  const handleAddToCart = () => {
    if (stock === 0) return;
    setLocalQuantity(1);
    addToCart({
      productId: product.id,
      variantId: activeVariantId,
      quantity: 1,
    });
  };

  const handleDecrease = () => {
    if (localQuantity > 0 && cartItem?.id) {
      const newQuantity = localQuantity - 1;
      setLocalQuantity(newQuantity);
      debouncedUpdateQuantity(cartItem.id, newQuantity);
    }
  };

  const handleIncrease = () => {
    if (stock > localQuantity && cartItem?.id) {
      const newQuantity = localQuantity + 1;
      setLocalQuantity(newQuantity);
      debouncedUpdateQuantity(cartItem.id, newQuantity);
    }
  };

  if (isLoading) {
    return (
      <Button disabled className={cn("w-full bg-secondary/50 text-muted-foreground rounded-2xl h-12 flex items-center justify-center", className)}>
        <Loader2 className="w-5 h-5 animate-spin" />
      </Button>
    );
  }

  if (stock === 0 || disabled) {
    return (
      <Button disabled className={cn("w-full bg-secondary/50 text-muted-foreground cursor-not-allowed rounded-2xl h-12 text-sm font-medium tracking-widest uppercase", className)}>
        {disabledText}
      </Button>
    );
  }

  return (
    <div className={cn("w-full flex items-center justify-center", className)}>
      {localQuantity === 0 ? (
        <Button
          className="w-full bg-foreground text-background hover:bg-foreground/90 transition-all rounded-2xl h-12 font-medium uppercase tracking-[0.15em] flex items-center justify-center gap-3 overflow-hidden group"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? (
             <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 group-hover:-translate-y-1 transition-transform duration-300" />
              <span className="group-hover:translate-x-1 transition-transform duration-300">Add to Bag</span>
            </>
          )}
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, borderRadius: "1rem" }}
          animate={{ opacity: 1, scale: 1, borderRadius: "1rem" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="flex items-center justify-between border border-border/50 px-2 py-1 w-full bg-background/50 backdrop-blur-sm h-12 rounded-2xl shadow-sm"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-secondary transition-colors text-foreground"
            onClick={handleDecrease}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <div className="flex flex-col items-center">
             <span className="text-base font-medium w-12 text-center text-foreground">{localQuantity}</span>
             {localQuantity >= stock && (
               <span className="text-[9px] text-red-500 uppercase tracking-widest absolute -bottom-5">Max Reached</span>
             )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-secondary transition-colors text-foreground"
            onClick={handleIncrease}
            disabled={localQuantity >= stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
