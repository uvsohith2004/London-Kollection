import { Button } from "@workspace/ui/components/button";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CartSummary } from "@/api-client/cart";
import { cn } from "@workspace/ui/lib/utils";
import { useRemoveCartItemMutation, useUpdateCartItemMutation } from "../mutations";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { useState, useEffect } from "react";
import { Price } from "@/components/price";

function MobileCartItem({ item }: { item: CartSummary["items"][number] }) {
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
    <div className={cn("flex gap-4 border-b border-border/50 pb-6 group transition-opacity", !item.isAvailable && "opacity-60", isRemoving && "opacity-50 pointer-events-none")}>
      <div className="relative w-28 h-28 shrink-0 bg-secondary/50 overflow-hidden rounded-2xl shadow-sm">
        {item.image ? (
          <Image 
            src={item.image} 
            alt={item.productName} 
            fill 
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 justify-between py-1">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-sm leading-tight pr-4">
              {item.productName}
              {!item.isAvailable && (
                <span className="block text-destructive text-xs font-semibold mt-1">Out of Stock</span>
              )}
            </h3>
            <button 
              onClick={handleRemove}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
          
          {item.optionValues && (
            <div className="mt-1 flex flex-col gap-0.5">
              {Object.entries(item.optionValues).map(([key, val]) => (
                <p key={key} className="text-xs text-muted-foreground">
                  {key}: {String(val)}
                </p>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <Price amount={item.unitPrice} className="font-semibold text-sm" />
            {item.compareAtPrice && item.compareAtPrice > item.unitPrice && (
              <Price amount={item.compareAtPrice} className="text-xs text-muted-foreground line-through" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
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
        </div>
      </div>
    </div>
  );
}

export function MobileCart({ summary }: { summary?: CartSummary }) {
  const items = summary?.items || [];
  const total = summary?.grandTotal || 0;
  const subtotal = summary?.subtotal || 0;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-4 mb-4">
        <h1 className="text-3xl font-serif tracking-tight">Shopping Bag</h1>
        <p className="text-sm text-muted-foreground mt-1">{items.length} items</p>
      </div>

      <div className="flex-1 px-4 pb-48">
        <div className="flex flex-col gap-6">
          {items.map((item) => (
            <MobileCartItem key={item.id} item={item} />
          ))}
        </div>
      </div>
      <div 
        className="fixed left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-4 z-40"
        style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium uppercase tracking-wider text-xs">Total</span>
          <Price amount={total} className="text-xl font-bold" />
        </div>
        <Link href="/checkout" className="block w-full">
          <Button className="w-full rounded-full py-6 uppercase tracking-widest text-xs font-bold shadow-2xl">
            Proceed To Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
