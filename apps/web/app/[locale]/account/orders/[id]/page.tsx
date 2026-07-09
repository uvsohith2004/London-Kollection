'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { useOrderDetailsQuery } from './services/queries';
import { ArrowLeft, Package, CheckCircle2, AlertTriangle, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cancelOrderApi } from '@/lib/api';
import { toast } from 'sonner';
import { OptimizedImage } from '@/components/optimized-image';

export default function AccountOrderDetailsPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = use(params);
  const { data: order, isLoading, refetch } = useOrderDetailsQuery(id);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [reviewModalData, setReviewModalData] = useState<{ productId: string; name: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (isLoading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading Order Details...
      </div>
    );
  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">Order not found</div>
    );

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
  const canCancel = ['pending', 'awaiting payment', 'payment verification', 'confirmed'].includes(status);
  const canReturn = status === 'delivered';

  // Resolve product info from either productMetadata or the joined product relation
  const getItemTitle = (item: any) =>
    item.productMetadata?.title || item.product?.title || 'Product';
  const getItemSlug = (item: any) =>
    item.productMetadata?.slug || item.product?.slug || null;
  const getItemImage = (item: any) => {
    // Try metadata first, then product.images relation
    if (item.productMetadata?.image) return item.productMetadata.image;
    if (item.product?.images?.length > 0) {
      const primary = item.product.images.find((img: any) => img.isPrimary);
      return (primary || item.product.images[0])?.asset;
    }
    return null;
  };

  // --- handlers ---
  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    try {
      setIsCancelling(true);
      await cancelOrderApi(order.id, { reason: cancelReason });
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }
    try {
      setIsSubmittingReview(true);
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('Review submitted successfully!');
      setReviewModalData(null);
      setReviewRating(0);
      setReviewText('');
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // --- timeline (simplified: removed Packed and Preparing) ---
  const TIMELINE_STAGES = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentStageIndex = TIMELINE_STAGES.findIndex((s) => s.toLowerCase() === status);
  const showTimeline = !['cancelled', 'returned', 'refunded'].includes(status);
  // For statuses that don't map directly (e.g. "preparing", "packed"), clamp to the last known stage
  const resolvedStageIndex = currentStageIndex >= 0
    ? currentStageIndex
    : ['preparing', 'packed', 'processing'].includes(status) ? 1 : -1; // after confirmed

  return (
    <div className="max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/${locale}/account/orders`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Link>
          <h1 className="text-3xl font-serif tracking-tight text-foreground">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground mt-1">
            Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 border border-destructive/50 text-destructive hover:bg-destructive/10 rounded-md text-sm font-medium transition-colors"
            >
              Cancel Order
            </button>
          )}
          {canReturn && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium transition-colors"
            >
              Request Return
            </button>
          )}
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" /> Invoice
          </button>
        </div>
      </div>

      {/* Cancellation Banner */}
      {status === 'cancelled' && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
          <div>
            <h3 className="font-semibold text-destructive">This order was cancelled</h3>
            <p className="text-sm text-destructive/80 mt-1">
              Reason: {order.cancellationReason || 'Not specified'}
            </p>
          </div>
        </div>
      )}

      {/* Progress Timeline - Redesigned as a horizontal progress bar */}
      {showTimeline && (
        <div className="bg-card border rounded-xl p-6 sm:p-8">
          <h3 className="font-semibold mb-8">Order Progress</h3>
          <div className="relative">
            {/* Progress bar background */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
            {/* Progress bar filled */}
            <div
              className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
              style={{
                width: resolvedStageIndex >= 0
                  ? `${(resolvedStageIndex / (TIMELINE_STAGES.length - 1)) * 100}%`
                  : '0%',
              }}
            />

            {/* Stage dots */}
            <div className="relative flex justify-between">
              {TIMELINE_STAGES.map((stage, idx) => {
                const isCompleted = resolvedStageIndex >= idx;
                const isCurrent = resolvedStageIndex === idx;
                return (
                  <div key={stage} className="flex flex-col items-center" style={{ width: `${100 / TIMELINE_STAGES.length}%` }}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-110'
                          : isCompleted
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card text-muted-foreground border-border'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-medium mt-3 text-center leading-tight ${
                        isCurrent ? 'text-primary font-semibold' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/20">
              <h3 className="font-semibold">Ordered Items</h3>
            </div>
            <div className="divide-y">
              {(order.items ?? []).map((item: any) => {
                const title = getItemTitle(item);
                const slug = getItemSlug(item);
                const image = getItemImage(item);

                return (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                    {/* Product thumbnail - clickable */}
                    {slug ? (
                      <Link href={`/${locale}/product/${slug}`} className="shrink-0">
                        <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex items-center justify-center hover:opacity-80 transition-opacity">
                          {image ? (
                            <OptimizedImage
                              asset={image}
                              alt={title}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-muted-foreground/30" />
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-lg shrink-0 flex items-center justify-center">
                        {image ? (
                          <OptimizedImage
                            asset={image}
                            alt={title}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-muted-foreground/30" />
                        )}
                      </div>
                    )}

                    {/* Product info - title clickable */}
                    <div className="flex-1">
                      {slug ? (
                        <Link href={`/${locale}/product/${slug}`} className="hover:underline">
                          <h4 className="font-semibold text-lg">{title}</h4>
                        </Link>
                      ) : (
                        <h4 className="font-semibold text-lg">{title}</h4>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                      {canReturn && (
                        <button
                          onClick={() =>
                            setReviewModalData({
                              productId: item.productId,
                              name: title,
                            })
                          }
                          className="mt-3 text-xs font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> Write a Review
                        </button>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">{safeNum(item.priceAtPurchase).toFixed(3)} KWD</p>
                    </div>
                  </div>
                );
              })}
              {(!order.items || order.items.length === 0) && (
                <div className="p-6 text-center text-muted-foreground">No items in this order.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Summaries */}
        <div className="space-y-6">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/20">
              <h3 className="font-semibold">Order Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{subtotal.toFixed(3)} KWD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingAmount.toFixed(3)} KWD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{taxAmount.toFixed(3)} KWD</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{discountAmount.toFixed(3)} KWD</span>
                </div>
              )}
              <div className="pt-4 border-t flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{totalAmount.toFixed(3)} KWD</span>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/20">
              <h3 className="font-semibold">Delivery Details</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Contact</p>
                <p className="text-sm font-medium">{addr.name || '—'}</p>
                <p className="text-sm text-muted-foreground">{addr.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Shipping Address</p>
                <p className="text-sm text-muted-foreground">{addr.addressLine1 || '—'}</p>
                {addr.addressLine2 && <p className="text-sm text-muted-foreground">{addr.addressLine2}</p>}
                <p className="text-sm text-muted-foreground">
                  {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}
                </p>
                <p className="text-sm text-muted-foreground">{addr.country || ''}</p>
                {addr.landmark && (
                  <p className="text-sm text-muted-foreground mt-1 italic">Landmark: {addr.landmark}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Cancel Order</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">
                  Reason for cancellation <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border rounded-md p-2 bg-background outline-none focus:border-primary"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found a better price">Found a better price</option>
                  <option value="Wrong address">Wrong address</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Delivery taking too long">Delivery taking too long</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border rounded-md font-medium text-sm hover:bg-muted"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md font-medium text-sm hover:bg-destructive/90 disabled:opacity-50"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden p-6 text-center space-y-4">
            <Package className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-xl font-bold">Request a Return</h3>
            <p className="text-muted-foreground text-sm">
              To process your return, please contact our support team at{' '}
              <a href="tel:97973479" className="font-bold underline">
                97973479
              </a>
              . We will guide you through the process.
            </p>
            <div className="pt-4">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">Write a Review</h3>
              <p className="text-sm text-muted-foreground mb-6">for {reviewModalData.name}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setReviewRating(star)} className="p-1 focus:outline-none">
                        <svg
                          className={`w-8 h-8 transition-colors ${star <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30 fill-transparent'}`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Review</label>
                  <textarea
                    rows={4}
                    className="w-full border rounded-md p-3 bg-background outline-none focus:border-primary resize-none"
                    placeholder="What did you like or dislike about this product?"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setReviewModalData(null);
                    setReviewRating(0);
                    setReviewText('');
                  }}
                  className="px-4 py-2 border rounded-md font-medium text-sm hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview || reviewRating === 0 || !reviewText.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
