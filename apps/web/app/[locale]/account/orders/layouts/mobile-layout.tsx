import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function MobileOrdersLayout({ orders }: { orders: any[] }) {
  const t = useTranslations('Orders');
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <h1 className="text-2xl font-serif tracking-tight mb-6 text-foreground">{t('titleMobile')}</h1>
      
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border px-4 text-center">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium mb-2 text-foreground">{t('noOrders')}</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {t('noOrdersDescMobile')}
          </p>
          <Link href={`/${locale}`} className="bg-foreground text-background px-6 py-3 rounded-full text-xs uppercase tracking-widest font-semibold w-full text-center">
            {t('shopNow')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4 pb-12">
          {orders.map(order => (
            <Link key={order.id} href={`/${locale}/account/orders/${order.id}`} dir="ltr" className="block bg-card p-5 rounded-2xl border border-border active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-sm text-foreground tracking-tight">{order.orderNumber}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-medium text-foreground">{Number(order.totalAmount).toFixed(2)} KWD</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {t(`status${(order.status || 'Processing').charAt(0).toUpperCase() + (order.status || 'Processing').slice(1).toLowerCase()}`)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground font-medium">{t('viewOrderDetails')}</span>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground">
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
