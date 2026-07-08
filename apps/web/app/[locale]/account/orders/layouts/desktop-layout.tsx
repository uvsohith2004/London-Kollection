import Link from 'next/link';
import { Package, ArrowRight, ChevronRight, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useTranslations, useLocale } from 'next-intl';

export default function DesktopOrdersLayout({ orders }: { orders: any[] }) {
  const t = useTranslations('Orders');
  const locale = useLocale();

  const getStatusIcon = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'SHIPPED': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-5xl py-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-serif tracking-tight text-foreground">{t('title')}</h1>
      </div>
      
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium mb-2 text-foreground">{t('noOrders')}</h2>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            {t('noOrdersDesc')}
          </p>
          <Button size="lg" className="rounded-full px-8 uppercase tracking-widest text-xs font-semibold">
            <Link href={`/${locale}`}>{t('discoverBtn')}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} dir="ltr" className="group flex items-center justify-between bg-card hover:bg-secondary/20 p-8 rounded-2xl border border-border transition-all duration-300">
              
              <div className="flex items-center gap-8">
                <div className="w-14 h-14 bg-secondary flex items-center justify-center rounded-full shrink-0">
                  <Package className="w-6 h-6 text-foreground/70" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-lg text-foreground tracking-tight">{order.orderNumber}</h3>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium text-foreground">
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{t(`status${(order.status || 'Processing').charAt(0).toUpperCase() + (order.status || 'Processing').slice(1).toLowerCase()}`)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('placedOn')} {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 ltr:text-right rtl:text-left">{t('totalAmount')}</p>
                  <p className="text-xl font-medium text-foreground">${Number(order.totalAmount).toFixed(2)}</p>
                </div>
                
                <Button variant="outline" className="rounded-full group-hover:bg-foreground group-hover:text-background transition-colors border-border">
                  <Link href={`/${locale}/account/orders/${order.id}`} className="flex items-center gap-2">
                    {t('viewDetails')}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
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
