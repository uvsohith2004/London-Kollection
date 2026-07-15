"use client";
import { useState } from 'react';
import { Package, Download } from 'lucide-react';
import { cancelOrderApi, api } from '@/api-client';
import { toast } from 'sonner';

interface OrderActionButtonsProps {
  orderId: string;
  orderNumber: string;
  canCancel: boolean;
  canReturn: boolean;
}

export function OrderActionButtons({ orderId, orderNumber, canCancel, canReturn }: OrderActionButtonsProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    try {
      setIsCancelling(true);
      await cancelOrderApi(orderId, { reason: cancelReason });
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const toastId = toast.loading('Generating invoice...');
      const response: any = await api.get(`/invoices/order/${orderId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully', { id: toastId });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to download invoice');
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleDownloadInvoice}
          className="h-12 px-6 bg-muted/20 hover:bg-muted/40 text-foreground text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 rounded-sm"
        >
          <Download className="w-4 h-4" />
          Invoice
        </button>
        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="h-12 px-6 border border-border text-foreground hover:bg-muted/10 text-sm font-bold uppercase tracking-widest transition-colors rounded-sm"
          >
            Cancel Order
          </button>
        )}
        {canReturn && (
          <button
            onClick={() => setShowReturnModal(true)}
            className="h-12 px-6 bg-foreground text-background hover:bg-foreground/90 text-sm font-bold uppercase tracking-widest transition-colors rounded-sm"
          >
            Return Order
          </button>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md p-8 border border-border shadow-2xl">
            <h3 className="text-2xl font-serif mb-4">Cancel Order</h3>
            <p className="text-muted-foreground text-sm mb-8">
              This action cannot be undone. Please select a reason below.
            </p>

            <div className="space-y-4 mb-8">
              <label className="text-sm font-medium text-foreground">
                Reason <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full border-b border-border p-3 bg-transparent outline-none focus:border-primary transition-colors text-sm"
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

            <div className="flex gap-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 h-12 border border-border font-medium text-sm hover:bg-muted/30 transition-colors rounded-sm"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 h-12 bg-destructive text-destructive-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 rounded-sm"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-background w-full max-w-md p-8 text-center border border-border shadow-2xl">
            <h3 className="text-2xl font-serif mb-4">Request a Return</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              To process your return, please contact our support team at{' '}
              <a href="tel:97973479" className="text-foreground underline underline-offset-4 decoration-border">
                97973479
              </a>
              .
            </p>
            <button
              onClick={() => setShowReturnModal(false)}
              className="w-full h-12 bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity rounded-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
