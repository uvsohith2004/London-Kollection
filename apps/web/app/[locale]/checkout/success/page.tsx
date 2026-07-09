"use client";

import Link from "next/link";
import { CheckCircle2, PhoneCall } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get("order") || "";

  return (
    <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-sm border border-border">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-8 border border-primary/20 relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <CheckCircle2 className="h-10 w-10 text-primary relative z-10" />
        </div>
        <h2 className="text-3xl font-serif tracking-tight text-foreground mb-2">Order Confirmed!</h2>
        <p className="text-muted-foreground mb-6">
          Thank you for your purchase. We've received your order and are getting it ready.
        </p>
        
        {orderNumber && (
          <div className="bg-primary/5 rounded-2xl p-6 mb-8 border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="relative z-10">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-2 font-semibold">Order Reference</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">{orderNumber}</p>
            </div>
          </div>
        )}

        <div className="bg-secondary/30 rounded-2xl p-6 mb-8 border border-border/50 text-left relative overflow-hidden">
          <div className="flex items-start gap-4 mb-4 relative z-10">
            <div className="p-2.5 bg-background rounded-xl shadow-sm border border-border/50 flex-shrink-0">
              <PhoneCall className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground tracking-tight">Need immediate assistance?</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-5 leading-relaxed">
                For order verification or any urgent support, our team is ready to help:
              </p>
              <div className="flex flex-col gap-3">
                <a href="tel:97973479" className="inline-flex items-center justify-center gap-3 h-12 bg-background rounded-xl border border-border/50 text-foreground font-medium hover:bg-secondary/50 transition-colors shadow-sm w-full">
                  <PhoneCall className="w-4 h-4 text-muted-foreground" />
                  97973479
                </a>
                <a href="tel:51759962" className="inline-flex items-center justify-center gap-3 h-12 bg-background rounded-xl border border-border/50 text-foreground font-medium hover:bg-secondary/50 transition-colors shadow-sm w-full">
                  <PhoneCall className="w-4 h-4 text-muted-foreground" />
                  51759962
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link 
            href={`/account/orders`} 
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-sm text-xs font-bold uppercase tracking-widest text-background bg-foreground hover:bg-foreground/90 transition-colors"
          >
            View Order Details
          </Link>
          <Link 
            href="/" 
            className="w-full flex justify-center py-4 px-4 border border-border rounded-full shadow-sm text-xs font-bold uppercase tracking-widest text-foreground bg-card hover:bg-secondary transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-card rounded-2xl"></div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
