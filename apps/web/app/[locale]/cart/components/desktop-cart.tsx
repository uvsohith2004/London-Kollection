import { useCartStore, CartStoreItem } from "@/store/cart-store";
import { Button } from "@workspace/ui/components/button";
import { Minus, Plus, Trash2, ShieldCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@workspace/ui/components/separator";

export function DesktopCart({ items, total }: { items: CartStoreItem[]; total: number }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

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
            <div key={item.id} className="flex gap-8 py-8 border-b border-border/50 group">
              {/* Product Image */}
              <div className="relative w-40 h-52 bg-secondary/30 overflow-hidden">
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
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <Link href={`/products/${item.productId}`} className="hover:underline hover:underline-offset-4">
                      <h3 className="font-medium text-lg tracking-wide">{item.productName}</h3>
                    </Link>
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
                  <p className="font-semibold text-lg">${Number(item.unitPrice).toFixed(2)}</p>
                </div>

                <div className="flex justify-between items-end mt-auto">
                  <div className="flex items-center border border-border/50 bg-background">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors group/remove"
                  >
                    <Trash2 className="w-4 h-4 group-hover/remove:scale-110 transition-transform" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Order Summary (Sticky) */}
      <div className="w-95 lg:w-105 shrink-0">
        <div className="sticky top-32 bg-secondary/10 border border-border/50 p-8">
          <h2 className="text-xl font-serif tracking-tight mb-6">Order Summary</h2>
          
          <div className="flex flex-col gap-4 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Shipping</span>
              <span className="font-medium uppercase text-xs tracking-widest text-green-600">Complimentary</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Tax</span>
              <span className="font-medium text-muted-foreground">Calculated at checkout</span>
            </div>
          </div>

          <Separator className="my-6 bg-border/50" />

          <div className="flex justify-between items-baseline mb-8">
            <span className="font-medium uppercase tracking-widest text-sm">Total</span>
            <span className="text-2xl font-bold">${total.toFixed(2)}</span>
          </div>

          <Link href="/checkout" className="block w-full">
            <Button className="w-full rounded-none py-7 text-xs tracking-[0.2em] uppercase font-bold group flex justify-center items-center gap-3 hover:bg-primary/90 transition-all shadow-xl">
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
