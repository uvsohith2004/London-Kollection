import Image from "next/image";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { X, ArrowRight, Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlist-store";

export default function DesktopWishlistLayout({ items }: { items: any[] }) {
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);

  const handleRemove = (id: string, name: string) => {
    removeFromWishlist(id);
    toast.success(`${name} removed from wishlist`);
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center bg-card rounded-2xl border border-border">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Heart className="h-8 w-8 text-muted-foreground" strokeWidth={1} />
        </div>
        <h2 className="mb-2 font-serif text-2xl tracking-tight text-foreground">
          Your wishlist is empty
        </h2>
        <p className="mb-8 max-w-md text-sm text-muted-foreground">
          You haven't saved any items yet. Curate your personal collection by tapping the heart icon on your favorite pieces.
        </p>
        <Button className="rounded-full px-8 uppercase tracking-widest text-xs font-semibold">
          <Link href="/">Discover Collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-x-8 gap-y-12">
      {items.map((item) => (
        <div key={item.id} className="group flex flex-col">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary rounded-xl mb-6">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.productName}
                fill
                className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                No Image
              </div>
            )}
            <button
              onClick={() => handleRemove(item.id, item.productName)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-foreground hover:text-background opacity-0 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Link href={item.variantId ? `/products/${item.productSlug}/${item.variantId}` : `/products/${item.productSlug}`} className="hover:underline underline-offset-4">
              <h3 className="font-serif text-lg tracking-tight line-clamp-1 text-foreground">
                {item.productName}
              </h3>
            </Link>
            <span className="text-sm font-medium text-muted-foreground">
              ${Number(item.price).toFixed(2)}
            </span>
          </div>

          <Button variant="outline" className="w-full mt-6 rounded-full border-border uppercase tracking-widest text-xs transition-colors hover:bg-foreground hover:text-background">
            <Link href={item.variantId ? `/products/${item.productSlug}/${item.variantId}` : `/products/${item.productSlug}`} className="w-full h-full flex items-center justify-center">
              View Product
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
