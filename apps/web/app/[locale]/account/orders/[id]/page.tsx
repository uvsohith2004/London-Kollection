import { serverApi } from '@/api-client/server';
import { ArrowLeft, Package, CheckCircle2, AlertTriangle, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from '@/i18n/routing';
import { OptimizedImage } from '@/components/optimized-image';
import { OrderActionButtons } from './components/order-actions';
import { ReviewButton } from './components/review-button';
import { formatAddressLine } from '@/lib/format-address';
import { notFound } from 'next/navigation';
import { OrderItem } from '@workspace/api-contracts';
import { formatBasePrice } from '@/lib/format-price';

export default async function AccountOrderDetailsPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;
  let order;
  let returnReq = null;

  try {
    const res = await serverApi.get(`/orders/${id}`);
    order = res?.order || res;
  } catch (error) {
    console.error("Failed to fetch order details", error);
    notFound();
  }

  try {
    const retRes = await serverApi.get(`/returns`);
    const allReturns = retRes?.data || retRes || [];
    returnReq = allReturns.find((r: any) => r.orderId === id) || null;
  } catch (error) {
    console.error("Failed to fetch return details", error);
  }

  if (!order) {
    notFound();
  }

  // --- helpers ---
  const addr: any = order.shippingAddress ?? {};

  const safeNum = (v: any) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const totalAmount = safeNum(order.totalAmount);
  const shippingAmount = safeNum(order.shippingAmount);
  const taxAmount = safeNum(order.taxAmount);
  const discountAmount = safeNum(order.discountAmount);
  const subtotal = totalAmount - shippingAmount - taxAmount;

  const status = (order.status ?? 'Pending').toLowerCase();
  const canCancel = 
    ['pending', 'awaiting payment', 'payment verification', 'confirmed'].includes(status) && 
    !['paid', 'captured'].includes((order.paymentStatus || '').toLowerCase());
  const RETURN_WINDOW_DAYS = 14;
  let daysLeftToReturn = -1;
  if (status === 'delivered' && order.deliveredAt) {
    const deliveredDate = new Date(order.deliveredAt);
    const now = new Date();
    const diffTime = now.getTime() - deliveredDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    daysLeftToReturn = Math.max(0, RETURN_WINDOW_DAYS - diffDays);
  }

  const canReturn = status === 'delivered' && daysLeftToReturn > 0;
  const postDeliveryStatuses = ['delivered', 'completed', 'return requested', 'exchange requested', 'returned', 'refunded', 'exchange completed'];
  const canReview = postDeliveryStatuses.includes(status.replace(/_/g, ' '));

  const getItemTitle = (item: any) => item.productMetadata?.title || item.product?.title || 'Product';
  const getItemSlug = (item: any) => item.productMetadata?.slug || item.product?.slug || null;
  const getItemImage = (item: any) => {
    if (item.productMetadata?.image) return item.productMetadata.image;
    if (item.product?.images?.length > 0) {
      const primary = item.product.images.find((img: any) => img.isPrimary);
      return (primary || item.product.images[0])?.asset;
    }
    return null;
  };

  // --- timeline ---
  const s = status.replace(/_/g, ' ');

  let TIMELINE_STAGES: any[] = [
    { key: 'Pending', label: 'Order Placed' },
    { key: 'Confirmed', label: 'Confirmed' },
    { key: 'Packed', label: 'Packed' },
    { key: 'Shipped', label: 'Shipped' },
    { key: 'Out for Delivery', label: 'Out for Delivery' },
    { key: 'Delivered', label: 'Delivered' }
  ];
  let resolvedStageIndex = -1;

  if (s === 'pending') resolvedStageIndex = 0;
  else if (s === 'confirmed' || s === 'preparing') resolvedStageIndex = 1;
  else if (s === 'packed') resolvedStageIndex = 2;
  else if (s === 'shipped') resolvedStageIndex = 3;
  else if (s === 'out for delivery') resolvedStageIndex = 4;
  else if (s === 'delivered' || s === 'completed' || s === 'return requested' || s === 'exchange requested' || s === 'returned') resolvedStageIndex = 5;

  if (returnReq && returnReq.status?.toLowerCase() !== 'cancelled') {
    const isExchange = returnReq.returnType?.toLowerCase() === 'exchange';
    const reqLabel = isExchange ? 'Exchange Requested' : 'Return Requested';
    TIMELINE_STAGES.push({ key: reqLabel, label: reqLabel });
    resolvedStageIndex = TIMELINE_STAGES.length - 1;

    if (returnReq.pickupDate) {
      TIMELINE_STAGES.push({ key: 'Pickup Scheduled', label: 'Pickup Scheduled' });
      resolvedStageIndex = TIMELINE_STAGES.length - 1;
    }
    
    if (returnReq.pickedUpAt || returnReq.status?.toLowerCase() === 'picked_up') {
      TIMELINE_STAGES.push({ key: 'Item Picked Up', label: 'Item Picked Up' });
      resolvedStageIndex = TIMELINE_STAGES.length - 1;
    }

    if (order.paymentStatus?.toLowerCase() === 'refunded' || returnReq.status?.toLowerCase() === 'refunded') {
      TIMELINE_STAGES.push({ key: 'Refunded', label: 'Refunded' });
      resolvedStageIndex = TIMELINE_STAGES.length - 1;
    } else if (['returned', 'completed', 'approved'].includes(returnReq.status?.toLowerCase())) {
      const finalLabel = isExchange ? 'Exchange Completed' : 'Returned';
      TIMELINE_STAGES.push({ key: finalLabel, label: finalLabel });
      resolvedStageIndex = TIMELINE_STAGES.length - 1;
    }
  } else if (s === 'return requested' || s === 'exchange requested') {
    const reqLabel = s === 'exchange requested' ? 'Exchange Requested' : 'Return Requested';
    TIMELINE_STAGES.push({ key: reqLabel, label: reqLabel });
    resolvedStageIndex = TIMELINE_STAGES.length - 1;
  }

  const showTimeline = !['cancelled'].includes(s);

  return (
    <div className="min-h-screen bg-background animate-in fade-in duration-500 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 lg:py-12">
        
        {/* Top Header */}
        <header className="mb-10 lg:mb-14 pb-8 border-b border-border/40 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <Link
              href={`/account/orders` as any}
              className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-3" />
              Back to orders
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground">
              Order #{order.orderNumber}
            </h1>
            <p className="text-muted-foreground mt-3 text-sm font-medium uppercase tracking-wider">
              Placed on {order.createdAt ? format(new Date(order.createdAt), "MMMM dd, yyyy") : 'Unknown date'}
            </p>
          </div>
          
          <OrderActionButtons 
            orderId={order.id} 
            orderNumber={order.orderNumber}
            canCancel={canCancel} 
            canReturn={canReturn} 
          />
        </header>

        {/* Cancellation Banners */}
        {status === 'cancelled' && (
          <div className="bg-destructive/5 p-6 mb-10 border-l-4 border-destructive rounded-r-lg">
            <h3 className="font-bold text-destructive text-lg uppercase tracking-wider">Order Cancelled</h3>
            <p className="font-medium text-destructive/80 mt-1 text-sm uppercase tracking-wider">Reason: {order.cancellationReason || 'Not specified'}</p>
            {order.paymentStatus?.toLowerCase() === 'paid' && (
              <p className="font-bold text-destructive mt-3 text-sm uppercase tracking-wider">Refund Pending</p>
            )}
            {order.paymentStatus?.toLowerCase() === 'refunded' && (
              <p className="font-bold text-green-700 mt-3 text-sm uppercase tracking-wider">Refund Processed Successfully</p>
            )}
          </div>
        )}


        <div className="flex flex-col gap-16 lg:gap-20 max-w-4xl mx-auto w-full">
          
          {/* Left Column: Purchased Items */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-6 pb-4 border-b border-border/30">Purchased Items</h2>
            <div className="space-y-0">
              {(order.items ?? []).map((item: OrderItem) => {
                const title = getItemTitle(item);
                const slug = getItemSlug(item);
                const itemImage = getItemImage(item);
                const itemPrice = safeNum(item.priceAtPurchase);

                return (
                  // FIXED LAYOUT: Using standard flexbox with min-w-0 entirely prevents the vertical stacking bug.
                  <div key={item.id} className="group flex flex-col sm:flex-row gap-5 sm:gap-8 items-start py-6 border-b border-border/40 last:border-0">
                    
                    {/* Item Image */}
                    <div className="w-24 sm:w-28 shrink-0 aspect-[4/5] bg-muted/20 relative overflow-hidden rounded flex items-center justify-center">
                      {itemImage ? (
                        <OptimizedImage
                          asset={itemImage}
                          alt={title}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground/30" strokeWidth={1} />
                      )}
                    </div>

                    {/* Item Details Container (min-w-0 forces it to respect boundaries) */}
                    <div className="flex-1 min-w-0 flex flex-col h-full justify-between w-full">
                      
                      {/* Top Row: Title & Price */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          {slug ? (
                            <Link href={`/product/${slug}` as any} className="hover:opacity-70 transition-opacity block">
                              {/* TRUNCATE fixes the character stacking */}
                              <h3 className="text-sm sm:text-base font-bold text-foreground uppercase tracking-widest truncate" title={title}>
                                {title}
                              </h3>
                            </Link>
                          ) : (
                            <h3 className="text-sm sm:text-base font-bold text-foreground uppercase tracking-widest truncate" title={title}>
                              {title}
                            </h3>
                          )}
                          <p className="text-muted-foreground mt-2 text-xs uppercase tracking-widest font-semibold">
                            Qty / {item.quantity}
                          </p>
                        </div>

                        {/* Price (Stays locked to the right) */}
                        <div className="shrink-0 text-right hidden sm:block">
                          <p className="text-base sm:text-lg font-bold tracking-widest">{formatBasePrice(itemPrice)}</p>
                        </div>
                      </div>

                      {/* Mobile Price Fallback */}
                      <div className="sm:hidden mt-2">
                        <p className="text-base font-bold tracking-widest">{formatBasePrice(itemPrice)}</p>
                      </div>

                      {/* Order Options */}
                      <div className="mt-6 flex flex-wrap gap-3">
                        {canReview && (
                          <ReviewButton 
                            productId={item.productId} 
                            productName={title} 
                            orderId={order.id}
                            orderItemId={item.id}
                            existingReview={(item as any).review}
                          />
                        )}
                        {canReturn && (
                          <Link
                            href={`/account/orders/${order.id}/return?item=${item.id}` as any}
                            className="text-[10px] sm:text-xs font-bold uppercase tracking-widest border border-border/60 px-4 py-2 hover:bg-foreground hover:text-background transition-colors flex items-center justify-center"
                          >
                            Return
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!order.items || order.items.length === 0) && (
                <p className="text-muted-foreground font-medium py-8 uppercase tracking-widest text-sm">No items found.</p>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="w-full">
            <div className="space-y-12">
              
              {/* Vertical Minimalist Tracking */}
              {showTimeline && (
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-widest mb-6 pb-4 border-b border-border/30">Order Status</h2>
                  <div className="relative ml-2 space-y-8 py-2">
                    {/* Continuous vertical line */}
                    <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-border/60 -z-10" />
                    
                    {TIMELINE_STAGES.map((stage, idx) => {
                      const isCompleted = resolvedStageIndex >= idx;
                      const isCurrent = resolvedStageIndex === idx;
                      
                      let stageDate: Date | null = null;
                      if (stage.key === 'Shipped' && order.shippedAt) stageDate = new Date(order.shippedAt);
                      else if (stage.key === 'Delivered' && order.deliveredAt) stageDate = new Date(order.deliveredAt);
                      else if (stage.key === 'Pending' && order.createdAt) stageDate = new Date(order.createdAt);
                      else if ((stage.key === 'Return Requested' || stage.key === 'Exchange Requested') && returnReq?.createdAt) stageDate = new Date(returnReq.createdAt);
                      else if (stage.key === 'Pickup Scheduled' && returnReq?.pickupDate) stageDate = new Date(returnReq.pickupDate);
                      else if (stage.key === 'Item Picked Up' && returnReq?.pickedUpAt) stageDate = new Date(returnReq.pickedUpAt);
                      else if ((stage.key === 'Returned' || stage.key === 'Exchange Completed' || stage.key === 'Refunded') && returnReq?.updatedAt) stageDate = new Date(returnReq.updatedAt);
                      
                      if (!stageDate && order.timeline?.length) {
                         const timelineEvent = order.timeline.find((t: any) => 
                           t.status?.toLowerCase().replace(/_/g, ' ') === stage.key.toLowerCase()
                         );
                         if (timelineEvent?.createdAt) {
                           stageDate = new Date(timelineEvent.createdAt);
                         }
                      }

                      return (
                        <div key={stage.key} className="relative pl-10">
                          {/* Minimalist dot */}
                          <div
                            className={`absolute left-0 top-1 w-[7px] h-[7px] rounded-full transition-colors ${
                              isCurrent
                                ? 'bg-foreground ring-4 ring-foreground/20'
                                : isCompleted
                                  ? 'bg-foreground'
                                  : 'bg-border'
                            }`}
                          />
                          
                          <p className={`font-bold uppercase tracking-widest text-xs sm:text-sm leading-none ${isCurrent ? 'text-foreground' : isCompleted ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                            {stage.label}
                          </p>
                          {stageDate ? (
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2">
                              {format(stageDate, "MMM dd, yyyy · hh:mm a")}
                            </p>
                          ) : (
                            <p className={`text-xs font-bold uppercase tracking-wider mt-2 ${isCompleted ? 'text-muted-foreground/80' : 'text-muted-foreground/40'}`}>
                              {isCompleted ? 'Completed' : 'Pending'}
                            </p>
                          )}
                          {stage.key === 'Shipped' && !isCompleted && order.estimatedDelivery && (
                            <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-widest mt-1">Est. Delivery: {format(new Date(order.estimatedDelivery), "MMM dd, yyyy")}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Details */}
              <div>
                <h2 className="text-lg font-bold uppercase tracking-widest mb-6 pb-4 border-b border-border/30">Delivery Info</h2>
                <div className="text-sm text-muted-foreground leading-relaxed font-medium uppercase tracking-wider space-y-1">
                  <p className="font-bold text-foreground mb-3 tracking-widest">{addr.name || '—'}</p>
                  <p>{addr.phone || '—'}</p>
                  <p className="mt-3">
                    {formatAddressLine(addr.addressLine1)}
                    {addr.addressLine2 && <><br />{addr.addressLine2}</>}
                    <br />
                    {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}
                    <br />
                    {addr.country || ''}
                  </p>
                  {addr.landmark && (
                    <p className="mt-4 pt-4 border-t border-border/30 font-bold">
                      Landmark: {addr.landmark}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-muted/5 border border-border/50 rounded-xl p-6 lg:p-8">
                <h2 className="text-base font-bold uppercase tracking-widest mb-6">Summary</h2>
                <div className="space-y-4 text-xs font-bold uppercase tracking-widest">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatBasePrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{formatBasePrice(shippingAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>{formatBasePrice(taxAmount)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatBasePrice(discountAmount)}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-5 border-t border-border/50 flex justify-between items-center">
                  <span className="font-bold uppercase tracking-widest text-sm">Total</span>
                  <span className="text-lg font-bold tracking-widest">{formatBasePrice(totalAmount)}</span>
                </div>

                <div className="mt-6 pt-5 border-t border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Payment Status</p>
                  <p className={`text-xs font-bold uppercase tracking-widest ${order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.paymentStatus || 'Pending'}
                  </p>
                </div>
                
                {status === 'delivered' && order.deliveredAt && (
                  <div className="mt-6 pt-5 border-t border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Return Window</p>
                    {daysLeftToReturn > 0 ? (
                      <p className="text-xs font-bold text-foreground uppercase tracking-widest">
                        {daysLeftToReturn} {daysLeftToReturn === 1 ? 'Day' : 'Days'} Left to Return
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-destructive uppercase tracking-widest">
                        Return Window Closed
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
