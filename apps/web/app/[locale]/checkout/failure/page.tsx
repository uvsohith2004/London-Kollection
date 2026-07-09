"use client";

import Link from "next/link";
import { XCircle, PhoneCall, RefreshCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function FailureContent() {
  const searchParams = useSearchParams();
  const reason = searchParams?.get("reason") || "An unknown error occurred during checkout.";
  const orderNumber = searchParams?.get("order");

  return (
    <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-sm border border-border">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-6">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-3xl font-serif tracking-tight text-foreground mb-2">Order Failed</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't complete your purchase. Please review the error details below.
        </p>
        
        <div className="bg-destructive/5 rounded-xl p-4 mb-8 border border-destructive/20 text-left">
          <p className="text-xs text-destructive uppercase tracking-widest mb-1 font-bold">Error Details</p>
          <p className="text-sm font-medium text-destructive/90 leading-relaxed">{reason}</p>
        </div>

        {orderNumber && (
          <div className="bg-secondary/50 rounded-xl p-4 mb-8 border border-border/50 text-left">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-bold">Attempted Order Number</p>
            <p className="text-lg font-medium text-foreground">{orderNumber}</p>
          </div>
        )}

        <div className="bg-blue-50/50 rounded-xl p-6 mb-8 border border-blue-100 text-left">
          <div className="flex items-start gap-3 mb-3">
            <PhoneCall className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900">Need help resolving this?</h3>
              <p className="text-sm text-blue-700 mt-1 mb-4">
                Our support team can help you complete your order over the phone:
              </p>
              <div className="flex flex-col gap-3">
                <a href="tel:97973479" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-blue-200 text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-sm w-full">
                  📞 97973479
                </a>
                <a href="tel:51759962" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-blue-200 text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-sm w-full">
                  📞 51759962
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link 
            href="/checkout" 
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-xs font-bold uppercase tracking-widest text-background bg-foreground hover:bg-foreground/90 transition-colors gap-2 items-center"
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </Link>
          <Link 
            href="/cart" 
            className="w-full flex justify-center py-4 px-4 border border-border rounded-full shadow-sm text-xs font-bold uppercase tracking-widest text-foreground bg-card hover:bg-secondary transition-colors"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-card rounded-2xl"></div>}>
        <FailureContent />
      </Suspense>
    </div>
  );
}
