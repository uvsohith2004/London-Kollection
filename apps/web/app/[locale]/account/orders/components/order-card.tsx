import { Package, ChevronRight } from "lucide-react"
import React from "react"
import { Order } from "@workspace/api-contracts"
import { Link } from "@/i18n/routing"
import { OptimizedImage } from "@/components/optimized-image"
import { format } from "date-fns"
import { Price } from "@/components/price"

interface OrderCardProps{
  order:Order
}

const OrderCard = ({order}:OrderCardProps) => {
  const items = order.items || [];
  const extraItems = items.length > 1 ? items.length - 1 : 0;
  
  const getItemImage = (item: any) => {
    if (!item) return null;
    if (item.productMetadata?.image) return item.productMetadata.image;
    if (item.productMetadata?.images?.[0]) return item.productMetadata.images[0];
    if (item.product?.images?.length > 0) {
      const primary = item.product.images.find((img: any) => img.isPrimary);
      return (primary || item.product.images[0])?.asset;
    }
    return null;
  };

  const firstImage = getItemImage(items[0]);

  return (
    <>
      <Link href={`/account/orders/${order.id}` as any} className="absolute inset-0 z-10" />
      
      {/* Header section with clean, flat design */}
      <div className="grid grid-cols-2 gap-3 border-b border-border/40 bg-muted/10 px-5 py-4 sm:grid-cols-3 relative z-0">
        <div className="flex flex-col">
          <span className="mb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            Order Placed
          </span>
          <span className="text-sm font-semibold text-foreground">
            {format(new Date(order.createdAt), "MMM dd, yyyy")}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="mb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            Order Number
          </span>
          <span className="text-sm font-semibold text-foreground">
            #{order.orderNumber}
          </span>
        </div>
        <div className="col-span-2 flex flex-col sm:col-span-1 sm:text-right">
          <span className="mb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            Total
          </span>
          <span className="text-sm font-bold text-foreground">
            <Price amount={order.totalAmount} />
          </span>
        </div>
      </div>
  
      <div className="flex flex-col sm:flex-row justify-between p-5 gap-4 items-start sm:items-center relative z-0">
        <div className="flex items-center gap-5 flex-1">
          <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/40 bg-background">
            {firstImage ? (
              <OptimizedImage
                asset={firstImage}
                alt="Product"
                fill
                className="object-cover"
              />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground/30" />
            )}
            {extraItems > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-[2px]">
                <span className="text-xs font-bold text-foreground">+{extraItems}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold tracking-wide uppercase text-foreground">
              {order.status}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </p>
          </div>
        </div>

        <div className="flex items-center text-sm font-semibold text-primary opacity-90 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
          View Details
          <ChevronRight className="ml-1 h-4 w-4" />
        </div>
      </div>
    </>
  )
}

export default OrderCard
