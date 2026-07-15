import Link from 'next/link';
import { Package, ArrowLeft, Truck, CheckCircle2, Clock, XCircle, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useTranslations, useLocale } from 'next-intl';
import { OrderProgressBar } from '@/components/order-progress-bar';
import { formatBasePrice } from '@/lib/format-price';

export default function DesktopOrderDetailLayout({ order }: { order: any }) {
  const t = useTranslations('Orders');
  const locale = useLocale();

  const getStatusIcon = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'DELIVERED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'SHIPPED': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-5xl py-8">
      <Link href={`/${locale}/account/orders`} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {t('backToOrders')}
      </Link>

      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-3xl font-serif tracking-tight text-foreground mb-2">{t('orderNumber', { id: order.orderNumber })}</h1>
          <p className="text-muted-foreground">
            {t('placedOn')} {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-secondary text-foreground font-medium border border-border/50">
          <span className="capitalize">{t(`status${(order.status || 'Processing').charAt(0).toUpperCase() + (order.status || 'Processing').slice(1).toLowerCase()}`)}</span>
        </div>
      </div>

      <div className="mb-10 bg-card p-8 rounded-2xl border border-border shadow-sm">
        <OrderProgressBar status={order.status} />
      </div>

      <div className="grid grid-cols-3 gap-10">
        <div className="col-span-2 space-y-10">
          
          <section>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">{t('items')}</h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {order.items?.map((item: any) => (
                  <div key={item.id} dir="ltr" className="p-6 flex gap-6 hover:bg-secondary/10 transition-colors">
                    <div className="w-24 h-32 bg-secondary rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden">
                      <Package className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div className="flex-1 py-1 flex flex-col justify-between ltr:ml-0 rtl:mr-0">
                      <div>
                        <h3 className="font-medium text-foreground text-lg mb-1">{item.productId}</h3>
                        <p className="text-sm text-muted-foreground mb-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>{t('quantity')}{item.quantity}</p>
                      </div>
                      <p className="font-medium text-foreground">{formatBasePrice(item.priceAtPurchase || item.price || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {order.description && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">{t('timeline')}</h2>
              <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-4 h-4 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{t('shippingUpdate')}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{order.description}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
        
        <div className="space-y-8">
          <section className="bg-card p-8 rounded-2xl border border-border shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-6">{t('orderSummary')}</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t('subtotal')}</span>
                <span>{formatBasePrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t('shipping')}</span>
                <span>{t('calculated')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t('tax')}</span>
                <span>{t('calculated')}</span>
              </div>
              <div className="border-t border-border pt-4 mt-4 flex justify-between font-medium text-lg text-foreground">
                <span>{t('total')}</span>
                <span>{formatBasePrice(order.totalAmount)}</span>
              </div>
            </div>
          </section>
          
          <section className="bg-secondary/30 p-8 rounded-2xl border border-border">
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">{t('needHelp')}</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {t('needHelpDesc')}
            </p>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-6">
              <h3 className="font-semibold text-blue-900 text-sm mb-1">Immediate Assistance</h3>
              <p className="text-xs text-blue-700 mb-3">Contact us directly for order verification or support:</p>
              <div className="flex flex-col gap-2">
                <a href="tel:97973479" className="text-sm font-medium text-blue-800 bg-white border border-blue-200 py-1.5 px-3 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors">
                  📞 97973479
                </a>
                <a href="tel:51759962" className="text-sm font-medium text-blue-800 bg-white border border-blue-200 py-1.5 px-3 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-colors">
                  📞 51759962
                </a>
              </div>
            </div>
            <div className="space-y-3">
              <Button className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium" >
                <Link href={`/${locale}/account/returns`}>{t('requestReturn')}</Link>
              </Button>
              <Button variant="outline" className="w-full bg-card hover:bg-secondary font-medium border-border text-foreground" >
                <Link href={`/${locale}/contact`}>{t('contactSupport')}</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
