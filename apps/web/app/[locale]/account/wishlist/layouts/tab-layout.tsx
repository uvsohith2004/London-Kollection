import Image from "next/image";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { X, Heart } from "lucide-react";
import { toast } from "sonner";
import { useRemoveFromWishlistMutation } from "../services/mutations";

export default function TabWishlistLayout({ items }: { items: any[] }) {
  const removeMutation = useRemoveFromWishlistMutation();

  const handleRemove = (id: string, name: string) => {
    removeMutation.mutate(id, {
      onSuccess: () => {
        toast.success(`${name} removed`);
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-card shadow-sm rounded-2xl border border-border">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          <Heart className="h-6 w-6 text-muted-foreground" strokeWidth={1} />
        </div>
        <h2 className="mb-2 font-medium text-lg text-foreground">
          Wishlist is empty
        </h2>
        <p className="mb-8 max-w-sm text-center text-sm text-muted-foreground">
          Tap the heart icon on your favorite pieces to save them here.
        </p>
        <Button className="rounded-full px-8 uppercase tracking-widest text-xs font-semibold">
          <Link href="/">Discover</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10">
      {items.map((item) => (
        <div key={item.id} className="group flex flex-col bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary rounded-lg mb-4">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                No Image
              </div>
            )}
            <button
              onClick={() => handleRemove(item.id, item.name)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-all hover:bg-foreground hover:text-background"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <Link href={`/products/${item.productId}`} className="hover:underline">
              <h3 className="font-serif text-base tracking-tight line-clamp-1 text-foreground">
                {item.name}
              </h3>
            </Link>
            <span className="text-sm font-medium text-muted-foreground">
              ${Number(item.price).toFixed(2)}
            </span>
          </div>

          <Button variant="outline" size="sm" className="w-full mt-auto rounded-xl border-border">
            <Link href={`/products/${item.productId}`} className="w-full h-full flex items-center justify-center">
              View Product
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
