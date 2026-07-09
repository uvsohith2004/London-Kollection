import { Button } from "@workspace/ui/components/button";
import { Minus, Plus, Trash2, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@workspace/ui/components/separator";
import { CartSummary } from "../queries";
import { cn } from "@workspace/ui/lib/utils";
import { useRemoveCartItemMutation, useUpdateCartItemMutation } from "../mutations";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { useState, useEffect } from "react";
import { Price } from "@/components/price";

function DesktopCartItem({ item }: { item: CartSummary["items"][number] }) {
  const { mutate: updateQuantity } = useUpdateCartItemMutation();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItemMutation();
  
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const debouncedUpdate = useDebounceCallback((newQty: number) => {
    if (newQty === 0) {
      removeItem(item.id);
    } else {
      updateQuantity({ itemId: item.id, quantity: newQty });
    }
  }, 400);

  const handleDecrease = () => {
    if (localQuantity > 1) {
      const newQty = localQuantity - 1;
      setLocalQuantity(newQty);
      debouncedUpdate(newQty);
    }
  };

  const handleIncrease = () => {
    if (localQuantity < item.stock) {
      const newQty = localQuantity + 1;
      setLocalQuantity(newQty);
      debouncedUpdate(newQty);
    }
  };

  const handleRemove = () => {
    removeItem(item.id);
  };

  return (
    <div className={cn("flex gap-8 py-8 border-b border-border/50 group relative transition-opacity", !item.isAvailable && "opacity-60", isRemoving && "opacity-50 pointer-events-none")}>
      {/* Product Image - Aspect Square */}
      <div className="relative w-36 h-36 shrink-0 bg-secondary/30 overflow-hidden rounded-2xl shadow-sm">
        {item.image ? (
          <Image 
            src={item.image} 
            alt={item.productName} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            No image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 py-1">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/products/${item.productSlug}`} className="hover:underline hover:underline-offset-4">
              <h3 className="font-medium text-lg tracking-wide">
                {item.productName}
              </h3>
            </Link>
            {!item.isAvailable && (
              <span className="block text-destructive text-sm font-semibold mt-1">Out of Stock</span>
            )}
            {item.optionValues && (
              <div className="mt-2 flex flex-col gap-1">
                {Object.entries(item.optionValues).map(([key, val]) => (
                  <p key={key} className="text-sm text-muted-foreground">
                    {key}: <span className="text-foreground">{String(val)}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="text-right">
            <Price amount={item.unitPrice} className="font-semibold text-lg" />
            {item.compareAtPrice && item.compareAtPrice > item.unitPrice && (
              <Price amount={item.compareAtPrice} className="text-sm text-muted-foreground line-through block" />
            )}
          </div>
        </div>

        <div className="flex justify-between items-end mt-auto">
          <div className="flex items-center border border-border/50 bg-background rounded-xl p-1 shadow-sm">
            <button 
              onClick={handleDecrease}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
              disabled={localQuantity <= 1}
            >
              <Minus className="w-3 h-3" />
            </button>
            <div className="flex flex-col items-center relative w-10">
              <span className="text-sm font-medium">{localQuantity}</span>
              {localQuantity >= item.stock && (
                 <span className="text-[8px] text-red-500 uppercase tracking-widest absolute -bottom-4 whitespace-nowrap">Max</span>
              )}
            </div>
            <button 
              onClick={handleIncrease}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
              disabled={!item.isAvailable || localQuantity >= item.stock}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button 
            onClick={handleRemove}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors group/remove"
          >
            {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 group-hover/remove:scale-110 transition-transform" />}
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function DesktopCart({ summary }: { summary?: CartSummary }) {
  const items = summary?.items || [];
  const total = summary?.grandTotal || 0;
  const subtotal = summary?.subtotal || 0;
  const taxTotal = summary?.taxTotal || 0;
  const deliveryFee = summary?.deliveryFee || 0;

  return (
    <div className="flex flex-col md:flex-row gap-12 lg:gap-24 relative">
      {/* Left Column: Cart Items */}
      <div className="flex-1">
        <div className="flex justify-between items-baseline mb-8">
          <h1 className="text-4xl font-serif tracking-tight">Shopping Bag</h1>
          <span className="text-muted-foreground">{items.length} items</span>
        </div>

        <div className="flex flex-col border-t border-border/50">
          {items.map((item) => (
             <DesktopCartItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Right Column: Order Summary (Sticky) */}
      <div className="w-95 lg:w-105 shrink-0">
        <div className="sticky top-32 bg-secondary/10 border border-border/50 p-8 rounded-2xl shadow-sm">
          <h2 className="text-xl font-serif tracking-tight mb-6">Order Summary</h2>
          
          <div className="flex flex-col gap-4 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <Price amount={subtotal} className="font-medium" />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              {deliveryFee === 0 ? (
                <span className="font-medium uppercase text-xs tracking-widest text-green-600">Complimentary</span>
              ) : (
                <Price amount={deliveryFee} className="font-medium" />
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Tax</span>
              <span className="font-medium">{taxTotal > 0 ? <Price amount={taxTotal} /> : "Calculated at checkout"}</span>
            </div>
          </div>

          <Separator className="my-6 bg-border/50" />

          <div className="flex justify-between items-baseline mb-8">
            <span className="font-medium uppercase tracking-widest text-sm">Total</span>
            <Price amount={total} className="text-2xl font-bold" />
          </div>

          <Link href="/checkout" className="block w-full">
            <Button className="w-full rounded-full py-7 text-xs tracking-[0.2em] uppercase font-bold group flex justify-center items-center gap-3 hover:bg-primary/90 transition-all shadow-md">
              Proceed to Checkout
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <div className="mt-8 flex items-start gap-3 text-muted-foreground">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <p className="text-xs leading-relaxed">
              Secure checkout. Free shipping and returns on all orders within 30 days. 
              View our return policy for details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
