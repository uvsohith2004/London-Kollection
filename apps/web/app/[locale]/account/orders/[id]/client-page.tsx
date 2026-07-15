"use client"
import { use, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useOrderDetailsQuery, useOrderReturnQuery } from "./services/queries"
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  MapPin,
  Package,
  PackageX,
  Phone,
  RotateCcw,
  ShieldAlert,
  Star,
  Truck,
  X,
  CreditCard,
} from "lucide-react"
import { format } from "date-fns"
import { cancelOrderApi, api } from "@/api-client"
import { toast } from "sonner"
import { OptimizedImage } from "@/components/optimized-image"
import { formatAddressLine } from "@/lib/format-address"
import { Price } from "@/components/price"
import { ReviewModal } from "@/components/reviews/review-modal"

/* ---------------------------------------------------------------- */
/* Shared bits                                                      */
/* ---------------------------------------------------------------- */

function useModalBehavior(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, onClose])
}

function ModalShell({
  onClose,
  children,
  labelledBy,
}: {
  onClose: () => void
  children: React.ReactNode
  labelledBy: string
}) {
  useModalBehavior(true, onClose)
  return (
    <div
      className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-sm duration-200 fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative w-full max-w-md animate-in rounded-xl border border-border bg-background p-6 shadow-xl duration-200 zoom-in-95"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-card shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/20 px-6 py-4">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  "return requested": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "return approved": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  returned: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    STATUS_STYLES[status.toLowerCase()] ??
    "bg-primary/10 text-primary border-primary/20"
  const label = status.replace(/\b\w/g, (c) => c.toUpperCase())
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  )
}

/* ---------------------------------------------------------------- */
/* Page                                                             */
/* ---------------------------------------------------------------- */

export default function AccountOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = use(params)
  const { data: order, isLoading, refetch } = useOrderDetailsQuery(id)
  const { data: returnRequest, refetch: refetchReturn } =
    useOrderReturnQuery(id)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isCancellingReturn, setIsCancellingReturn] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [reviewModalData, setReviewModalData] = useState<{
    productId: string
    orderItemId: string
    name: string
  } | null>(null)
  const cancelReasonRef = useRef<HTMLSelectElement>(null)

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex animate-pulse flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading order details...
          </p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <PackageX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">Order Not Found</h2>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          We couldn't locate the order you're looking for. It may have been
          removed or the link is incorrect.
        </p>
        <Link
          href={`/${locale}/account/orders`}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </div>
    )
  }

  // --- helpers ---
  const addr: any = order.shippingAddress ?? {}

  const safeNum = (v: any) => {
    const n = Number(v)
    return isNaN(n) ? 0 : n
  }

  const totalAmount = safeNum(order.totalAmount)
  const shippingAmount = safeNum(order.shippingAmount)
  const taxAmount = safeNum(order.taxAmount)
  const discountAmount = safeNum(order.discountAmount)
  const subtotal = totalAmount - shippingAmount - taxAmount

  const status = (order.status ?? "Pending").toLowerCase()
  const canCancel = [
    "pending",
    "awaiting payment",
    "payment verification",
    "confirmed",
  ].includes(status)
  const canReturn = status === "delivered"

  const getItemTitle = (item: any) =>
    item.productMetadata?.title || item.product?.title || "Unknown Product"
  const getItemSlug = (item: any) =>
    item.productMetadata?.slug || item.product?.slug || null
  const getItemImage = (item: any) => {
    if (item.productMetadata?.image) return item.productMetadata.image
    if (item.product?.images?.length > 0) {
      const primary = item.product.images.find((img: any) => img.isPrimary)
      return (primary || item.product.images[0])?.asset
    }
    return null
  }

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation")
      cancelReasonRef.current?.focus()
      return
    }
    try {
      setIsCancelling(true)
      await cancelOrderApi(order.id, { reason: cancelReason })
      toast.success("Order cancelled successfully")
      setShowCancelModal(false)
      refetch()
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel order")
    } finally {
      setIsCancelling(false)
    }
  }

  const handleCancelReturn = async () => {
    if (!returnRequest) return
    try {
      setIsCancellingReturn(true)
      await api.post(`/commerce/returns/${returnRequest.id}/cancel`)
      toast.success("Return cancelled successfully")
      refetchReturn()
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel return")
    } finally {
      setIsCancellingReturn(false)
    }
  }



  const handleDownloadInvoice = async () => {
    try {
      const toastId = toast.loading("Generating invoice...")
      const response = await api.get(
        `/commerce/invoices/order/${order.id}/download`,
        { responseType: "blob" }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `Invoice-${order.orderNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("Invoice downloaded successfully", { id: toastId })
    } catch (err: any) {
      toast.error(err?.message || "Failed to download invoice")
    }
  }

  // --- timeline ---
  const TIMELINE_STAGES = [
    { key: "Pending", label: "Order Placed", desc: "Order received" },
    { key: "Confirmed", label: "Confirmed", desc: "Payment verified" },
    { key: "Packed", label: "Packed", desc: "Ready for shipping" },
    { key: "Shipped", label: "Shipped", desc: "In transit" },
    {
      key: "Out for Delivery",
      label: "Out for Delivery",
      desc: "Arriving today",
    },
    { key: "Delivered", label: "Delivered", desc: "Successfully delivered" },
  ]

  let resolvedStageIndex = -1
  const s = status.replace(/_/g, " ")

  if (s === "pending") resolvedStageIndex = 0
  else if (s === "confirmed" || s === "preparing") resolvedStageIndex = 1
  else if (s === "packed") resolvedStageIndex = 2
  else if (s === "shipped") resolvedStageIndex = 3
  else if (s === "out for delivery") resolvedStageIndex = 4
  else if (s === "delivered" || s === "completed" || s.includes("return"))
    resolvedStageIndex = 5

  const showTimeline = !["cancelled"].includes(s)

  return (
    <div className="w-full">
      {/* Header Section */}
      <header className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Link
            href={`/${locale}/account/orders`}
            className="group mb-4 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Orders
          </Link>
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Order #{order.orderNumber}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Placed on{" "}
            <span className="font-medium text-foreground">
              {format(new Date(order.createdAt), "MMMM dd, yyyy")}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadInvoice}
            className="inline-flex items-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Download className="mr-2 h-4 w-4" />
            Invoice
          </button>
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:outline-none"
            >
              Cancel Order
            </button>
          )}
          {canReturn && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Return Items
            </button>
          )}
        </div>
      </header>

      {/* Alert Banners */}
      {status === "cancelled" && (
        <div className="mb-8 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <h3 className="font-semibold text-destructive">Order Cancelled</h3>
            <p className="mt-1 text-sm text-destructive/90">
              Reason: {order.cancellationReason || "Not specified"}
            </p>
            {order.paymentStatus?.toLowerCase() === "paid" && (
              <p className="mt-2 text-sm font-medium text-destructive">
                Refund Pending
              </p>
            )}
            {order.paymentStatus?.toLowerCase() === "refunded" && (
              <p className="mt-2 text-sm font-medium text-emerald-600">
                Refund Processed Successfully
              </p>
            )}
          </div>
        </div>
      )}

      {returnRequest && returnRequest.status?.toLowerCase() !== "cancelled" && (
        <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 md:flex-row md:items-center">
          <div className="flex gap-3">
            <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-700">
                Return Request ({returnRequest.status})
              </h3>
              <p className="mt-1 text-sm text-amber-700/80">
                Type: {returnRequest.returnType}
              </p>
              {returnRequest.pickupDate && (
                <p className="mt-2 text-sm font-medium text-amber-700">
                  Pickup:{" "}
                  {format(new Date(returnRequest.pickupDate), "MMMM dd, yyyy")}
                </p>
              )}
            </div>
          </div>
          {!returnRequest.pickedUpAt &&
            returnRequest.status?.toLowerCase() !== "picked_up" && (
              <button
                onClick={handleCancelReturn}
                disabled={isCancellingReturn}
                className="shrink-0 rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                {isCancellingReturn ? "Cancelling..." : "Cancel Return"}
              </button>
            )}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {/* Left Column (Items & Delivery) */}
        <div className="space-y-8 lg:col-span-2">
          {/* Purchased Items */}
          <SectionCard
            icon={Package}
            title={`Purchased Items (${(order.items ?? []).length})`}
          >
            <div className="divide-y divide-border">
              {(order.items ?? []).map((item: any) => {
                const title = getItemTitle(item)
                const slug = getItemSlug(item)
                const image = getItemImage(item)
                const itemPrice = safeNum(item.priceAtPurchase)
                const lineTotal = itemPrice * safeNum(item.quantity || 1)

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-5 py-4 first:pt-0 last:pb-0 sm:flex-row"
                  >
                    {/* Image */}
                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted sm:h-28 sm:w-28">
                      {image ? (
                        <OptimizedImage
                          asset={image}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground/30" />
                      )}
                      {slug && (
                        <Link
                          href={`/${locale}/product/${slug}`}
                          className="absolute inset-0"
                          aria-label={title}
                        />
                      )}
                    </div>

                    {/* Content (Flex-1 min-w-0 strictly prevents text overflow bugs) */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          {slug ? (
                            <Link
                              href={`/${locale}/product/${slug}`}
                              className="group"
                            >
                              <h3 className="truncate text-base font-medium text-foreground underline-offset-2 group-hover:underline">
                                {title}
                              </h3>
                            </Link>
                          ) : (
                            <h3 className="truncate text-base font-medium text-foreground">
                              {title}
                            </h3>
                          )}
                          <p className="mt-1 text-sm text-muted-foreground">
                            Qty: {item.quantity} &times;{" "}
                            <Price amount={itemPrice} />
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-foreground">
                            <Price amount={lineTotal} />
                          </p>
                        </div>
                      </div>

                      {canReturn && (
                        <div className="mt-auto pt-4">
                          <button
                            onClick={() =>
                              setReviewModalData({
                                productId: item.productId,
                                orderItemId: item.id,
                                name: title,
                              })
                            }
                            className="inline-flex items-center text-xs font-medium text-primary transition-colors hover:text-primary/80"
                          >
                            <Star className="mr-1 h-3.5 w-3.5" />
                            Write a Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
              {(!order.items || order.items.length === 0) && (
                <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
                  <Package className="mb-2 h-10 w-10 opacity-20" />
                  <p className="text-sm">No items found in this order.</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Delivery Details */}
          <SectionCard icon={MapPin} title="Delivery Address">
            <div className="flex flex-col justify-between gap-6 sm:flex-row">
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="mb-2 text-base font-semibold text-foreground">
                  {addr.name || "—"}
                </p>
                <p>{formatAddressLine(addr.addressLine1)}</p>
                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                <p>
                  {[addr.city, addr.state, addr.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="pt-1 font-medium text-foreground">
                  {addr.country}
                </p>
                {addr.landmark && (
                  <p className="mt-2 inline-block rounded bg-muted/40 px-2 py-1 text-xs">
                    <span className="font-medium text-foreground">
                      Landmark:
                    </span>{" "}
                    {addr.landmark}
                  </p>
                )}
              </div>
              {addr.phone && (
                <div className="shrink-0">
                  <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Contact
                  </p>
                  <p className="flex items-center rounded-md bg-muted/40 px-3 py-1.5 text-sm font-medium text-foreground">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    {addr.phone}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right Column (Timeline & Summary) */}
        <div className="space-y-8 lg:col-span-1">
          {/* Order Summary */}
          <SectionCard icon={CreditCard} title="Payment Summary">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span><Price amount={subtotal} /></span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span><Price amount={shippingAmount} /></span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span><Price amount={taxAmount} /></span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between font-medium text-emerald-600">
                  <span>Discount</span>
                  <span>-<Price amount={discountAmount} /></span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
                <span className="text-base font-semibold text-foreground">
                  Total
                </span>
                <span className="text-lg font-bold text-foreground">
                  <Price amount={totalAmount} />
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-lg bg-muted/40 p-3">
              <span className="text-sm font-medium text-muted-foreground">
                Status
              </span>
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                  order.paymentStatus?.toLowerCase() === "paid"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {order.paymentStatus?.toUpperCase() || "PENDING"}
              </span>
            </div>
          </SectionCard>

          {/* Tracking Timeline */}
          {showTimeline && (
            <div className="sticky top-6">
              <SectionCard icon={Truck} title="Tracking History">
                <div className="relative pl-2">
                  {/* Vertical Line */}
                  <div className="absolute top-2 bottom-2 left-[11px] w-0.5 bg-muted" />

                  <div className="space-y-6">
                    {TIMELINE_STAGES.map((stage, idx) => {
                      const isCompleted = resolvedStageIndex >= idx
                      const isCurrent = resolvedStageIndex === idx

                      let stageDate: Date | null = null
                      if (stage.key === "Shipped" && order.shippedAt)
                        stageDate = new Date(order.shippedAt)
                      if (stage.key === "Delivered" && order.deliveredAt)
                        stageDate = new Date(order.deliveredAt)
                      if (stage.key === "Pending" && order.createdAt)
                        stageDate = new Date(order.createdAt)

                      return (
                        <div key={stage.key} className="relative pl-8">
                          {/* Node Point */}
                          <div
                            className={`absolute top-1 left-0 z-10 h-2.5 w-2.5 rounded-full ${
                              isCurrent
                                ? "bg-primary ring-4 ring-primary/20"
                                : isCompleted
                                  ? "bg-primary"
                                  : "border border-border bg-muted"
                            }`}
                          />
                          <div
                            className={`flex flex-col ${!isCompleted && "opacity-50"}`}
                          >
                            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              {stage.label}
                              {isCompleted && !isCurrent && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {stage.desc}
                            </p>
                            {stageDate && isCompleted && (
                              <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                                {format(stageDate, "MMM dd, yyyy · hh:mm a")}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      </div>

      {/* Modals (Logic unchanged, styled to match new UI) */}
      {showCancelModal && (
        <ModalShell
          labelledBy="cancel-order-title"
          onClose={() => setShowCancelModal(false)}
        >
          <h3 id="cancel-order-title" className="mb-2 text-xl font-semibold">
            Cancel Order
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            This action cannot be undone. Please select a reason below to
            proceed.
          </p>

          <div className="mb-6 space-y-2">
            <label
              htmlFor="cancel-reason"
              className="text-sm font-medium text-foreground"
            >
              Reason <span className="text-destructive">*</span>
            </label>
            <select
              id="cancel-reason"
              ref={cancelReasonRef}
              className="w-full rounded-md border border-border bg-background p-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            >
              <option value="">Select a reason...</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found a better price">Found a better price</option>
              <option value="Wrong address">Wrong address</option>
              <option value="Changed my mind">Changed my mind</option>
              <option value="Delivery taking too long">
                Delivery taking too long
              </option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Keep Order
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="text-destructive-foreground flex-1 rounded-md bg-destructive px-4 py-2 text-sm font-medium transition-colors hover:bg-destructive/90 disabled:opacity-50"
            >
              {isCancelling ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
        </ModalShell>
      )}

      {showReturnModal && (
        <ModalShell
          labelledBy="return-order-title"
          onClose={() => setShowReturnModal(false)}
        >
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <RotateCcw className="h-6 w-6 text-foreground" />
            </div>
            <h3 id="return-order-title" className="mb-2 text-xl font-semibold">
              Request a Return
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              To process your return safely and securely, please contact our
              dedicated support team at <br />
              <a
                href="tel:97973479"
                className="mt-2 inline-block font-semibold text-foreground hover:underline"
              >
                97973479
              </a>
              .
            </p>
            <button
              onClick={() => setShowReturnModal(false)}
              className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Close
            </button>
          </div>
        </ModalShell>
      )}

      {reviewModalData && (
        <ReviewModal
          orderId={order.id}
          orderItemId={reviewModalData.orderItemId}
          productName={reviewModalData.name}
          onClose={() => setReviewModalData(null)}
        />
      )}
    </div>
  )
}
