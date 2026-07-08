import { useCartStore, CartStoreItem } from "@/store/cart-store";
import { Button } from "@workspace/ui/components/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function MobileCart({ items, total }: { items: CartStoreItem[]; total: number }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-4 mb-4">
        <h1 className="text-3xl font-serif tracking-tight">Shopping Bag</h1>
        <p className="text-sm text-muted-foreground mt-1">{items.length} items</p>
      </div>

      <div className="flex-1 px-4 pb-48">
        <div className="flex flex-col gap-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 border-b pb-6">
              <div className="relative w-28 h-36 bg-secondary/50 overflow-hidden">
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
              <div className="flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm leading-tight pr-4">{item.productName}</h3>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
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
                  
                  <p className="font-semibold text-sm mt-2">${Number(item.unitPrice).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center border border-border/50">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile (sits above the global bottom navbar) */}
      <div 
        className="fixed left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-4 z-40"
        style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium uppercase tracking-wider text-xs">Total</span>
          <span className="text-xl font-bold">${total.toFixed(2)}</span>
        </div>
        <Link href="/checkout" className="block w-full">
          <Button className="w-full rounded-none py-6 uppercase tracking-widest text-xs font-bold shadow-2xl">
            Proceed To Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
