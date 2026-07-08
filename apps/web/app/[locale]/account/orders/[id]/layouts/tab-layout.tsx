import Link from 'next/link';
import { Package, ArrowLeft, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useTranslations, useLocale } from 'next-intl';
import { OrderProgressBar } from '@/components/order-progress-bar';

export default function TabOrderDetailLayout({ order }: { order: any }) {
  const t = useTranslations('Orders');
  const locale = useLocale();

  return (
    <div className="max-w-3xl py-6">
      <Link href={`/${locale}/account/orders`} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {t('backToOrders')}
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-serif tracking-tight text-foreground mb-2">{t('orderNumber', { id: order.orderNumber })}</h1>
        <p className="text-muted-foreground text-sm">
          {t('placedOn')} {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm mb-8">
        <div className="mb-6 pb-6 border-b border-border">
           <OrderProgressBar status={order.status} />
        </div>
        
        <div className="flex justify-between items-center mb-6">
           <div className="text-right ltr:text-left rtl:text-right">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t('total')}</p>
              <p className="font-medium text-xl text-foreground">${Number(order.totalAmount).toFixed(2)}</p>
           </div>
        </div>
        
        {order.description && (
           <div className="mb-8 p-5 bg-secondary/50 rounded-xl text-sm border border-border/50">
             <div className="flex items-start gap-3">
               <Truck className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
               <p className="text-muted-foreground leading-relaxed">{order.description}</p>
             </div>
           </div>
        )}

        <h3 className="text-xs uppercase tracking-widest text-foreground font-bold mb-4">{t('nItems', { count: order.items?.length || 0 })}</h3>
        <div className="space-y-4">
          {order.items?.map((item: any) => (
            <div key={item.id} dir="ltr" className="p-5 flex gap-5 hover:bg-secondary/10 transition-colors">
              <div className="w-20 h-28 bg-secondary rounded-lg shrink-0 flex items-center justify-center relative overflow-hidden">
                <Package className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">{item.productId}</h3>
                <p className="text-sm text-muted-foreground mb-2" dir={locale === 'ar' ? 'rtl' : 'ltr'}>{t('quantity')}{item.quantity}</p>
              </div>
              <p className="font-medium text-foreground">${Number(item.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="w-full h-12 rounded-xl font-medium border-border text-foreground" >
          <Link href={`/${locale}/contact`}>{t('contactSupport')}</Link>
        </Button>
        <Button className="w-full h-12 rounded-xl font-medium bg-foreground text-background hover:bg-foreground/90" >
          <Link href={`/${locale}/account/returns`}>{t('requestReturn')}</Link>
        </Button>
      </div>
    </div>
  );
}
