import Link from 'next/link';
import { Package, ArrowLeft, Truck, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useTranslations, useLocale } from 'next-intl';
import { OrderProgressBar } from '@/components/order-progress-bar';

export default function MobileOrderDetailLayout({ order }: { order: any }) {
  const t = useTranslations('Orders');
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Native-like sticky header */}
      <div className="bg-background/80 backdrop-blur-md px-4 py-4 sticky top-0 z-10 border-b border-border flex items-center justify-between">
        <Link href={`/${locale}/account/orders`} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary active:scale-95 transition-all text-foreground">
          <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
        </Link>
        <h1 className="font-medium text-foreground tracking-tight">{t('orderDetails')}</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="p-4 space-y-4">
        {/* Order Meta Card */}
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 font-bold">{t('orderNumberUpper')}</p>
              <h2 className="font-serif text-xl tracking-tight text-foreground">{order.orderNumber}</h2>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xl font-medium text-foreground">{Number(order.totalAmount).toFixed(2)} KWD</span>
              <p className="text-xs text-muted-foreground mt-0.5">{t('totalAmount')}</p>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm pt-5 border-t border-border">
            <span className="text-muted-foreground">{t('datePlaced')}</span>
            <span className="font-medium text-foreground">{new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-US')}</span>
          </div>
        </div>
        
        {/* Status Card */}
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border">
           <OrderProgressBar status={order.status} />
          {order.description && (
             <div className="mt-4 pt-4 border-t border-border">
               <p className="text-sm text-muted-foreground leading-relaxed">{order.description}</p>
             </div>
          )}
        </div>

        {/* Items Card */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="px-5 py-4 bg-secondary/30 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-widest text-foreground">{t('items')}</h3>
            <span className="text-xs text-muted-foreground font-medium">{t('nItems', { count: order.items?.length || 0 })}</span>
          </div>
          <div className="p-5 space-y-5">
            {order.items?.map((item: any) => (
              <div key={item.id} dir="ltr" className="p-4 flex gap-4">
                <div className="w-20 h-24 bg-secondary rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden">
                  <Package className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <div className="flex-1 ltr:ml-0 rtl:mr-0">
                  <h3 className="font-medium text-foreground text-sm line-clamp-1 mb-1">{item.productId}</h3>
                  <p className="text-sm text-muted-foreground mb-1" dir={locale === 'ar' ? 'rtl' : 'ltr'}>{t('qty')}{item.quantity}</p>
                  <p className="font-medium text-foreground text-sm">{Number(item.priceAtPurchase || item.price || 0).toFixed(2)} KWD</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Card */}
        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 mt-6">
          <h3 className="font-semibold text-sm mb-1 text-blue-900">Immediate Assistance</h3>
          <p className="text-xs text-blue-700 mb-4">Contact us directly for order verification or support:</p>
          <div className="flex flex-col gap-2">
            <a href="tel:97973479" className="w-full text-sm font-medium text-blue-800 bg-white border border-blue-200 h-12 rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors shadow-sm">
              📞 97973479
            </a>
            <a href="tel:51759962" className="w-full text-sm font-medium text-blue-800 bg-white border border-blue-200 h-12 rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors shadow-sm">
              📞 51759962
            </a>
          </div>
        </div>

        <div className="bg-secondary/30 p-5 rounded-2xl border border-border mt-4">
          <h3 className="font-medium text-sm mb-3 text-foreground">{t('orderAssistance')}</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-card border-border h-12 rounded-xl text-foreground font-medium" >
              <Link href={`/${locale}/account/returns`}>{t('requestAReturn')}</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-card border-border h-12 rounded-xl text-foreground font-medium" >
              <Link href={`/${locale}/contact`}>{t('contactSupport')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
