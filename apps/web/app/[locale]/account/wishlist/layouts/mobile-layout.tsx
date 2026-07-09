import Image from "next/image";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Trash2, Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlist-store";

export default function MobileWishlistLayout({ items }: { items: any[] }) {
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);

  const handleRemove = (id: string, name: string) => {
    removeFromWishlist(id);
    toast.success(`${name} removed`);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background px-4 py-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-card border border-border shadow-sm rounded-full flex items-center justify-center mb-6">
          <Heart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium mb-3 text-foreground">Wishlist is empty</h2>
        <p className="text-muted-foreground text-sm mb-8 px-4">
          You haven't saved any items yet.
        </p>
        <Button className="w-full max-w-[200px] h-12 rounded-xl font-medium">
          <Link href="/">Discover</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <h1 className="text-xl font-medium mb-6">Wishlist</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="flex gap-4">
              <Link href={item.variantId ? `/products/${item.productSlug}/${item.variantId}` : `/products/${item.productSlug}`} className="shrink-0">
                <div className="relative w-20 aspect-[3/4] bg-secondary rounded-lg overflow-hidden">
                  {item.image && (
                    <Image src={item.image} alt={item.productName} fill className="object-cover" />
                  )}
                </div>
              </Link>
              <div className="flex-1 flex flex-col pt-1">
                <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-snug mb-1">{item.productName}</h3>
                <span className="text-xs font-medium text-muted-foreground mb-4">
                  ${Number(item.price).toFixed(2)}
                </span>
                
                <div className="mt-auto flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 h-10 rounded-xl bg-card border-border text-xs">
                    <Link href={item.variantId ? `/products/${item.productSlug}/${item.variantId}` : `/products/${item.productSlug}`}>View</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 shrink-0 rounded-xl bg-card border-border text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemove(item.id, item.productName)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
