import Link from 'next/link';
import { Package, ArrowRight, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useTranslations, useLocale } from 'next-intl';

export default function TabOrdersLayout({ orders }: { orders: any[] }) {
  const t = useTranslations('Orders');
  const locale = useLocale();

  const getStatusIcon = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'DELIVERED': return <CheckCircle2 className="w-3 h-3 text-green-500" />;
      case 'SHIPPED': return <Truck className="w-3 h-3 text-blue-500" />;
      case 'CANCELLED': return <XCircle className="w-3 h-3 text-red-500" />;
      default: return <Clock className="w-3 h-3 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-3xl py-8">
      <h1 className="text-2xl font-serif tracking-tight mb-8 text-foreground">{t('title')}</h1>
      
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-card rounded-2xl border border-border px-6 text-center">
          <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-5">
            <Package className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium mb-2 text-foreground">{t('noOrders')}</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {t('noOrdersDesc')}
          </p>
          <Button className="rounded-full px-6 uppercase tracking-widest text-xs font-semibold">
            <Link href={`/${locale}`}>{t('discoverBtn')}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} dir="ltr" className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-12 h-12 bg-secondary flex items-center justify-center rounded-full shrink-0">
                  <Package className="w-5 h-5 text-foreground/70" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{order.orderNumber}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      {getStatusIcon(order.status)}
                      <span className="capitalize text-xs">{t(`status${(order.status || 'Processing').charAt(0).toUpperCase() + (order.status || 'Processing').slice(1).toLowerCase()}`)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-border pt-4 sm:pt-0">
                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5 ltr:sm:text-right rtl:sm:text-left">{t('total')}</p>
                  <p className="text-lg font-medium text-foreground">{Number(order.totalAmount).toFixed(2)} KWD</p>
                </div>
                
                <Button  variant="outline" size="sm" className="rounded-full border-border">
                  <Link href={`/${locale}/account/orders/${order.id}`}>
                    {t('details')}
                  </Link>
                </Button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
