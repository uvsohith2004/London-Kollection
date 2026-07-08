'use client';
import { Switch } from '@workspace/ui/components/switch';
import { Button } from '@workspace/ui/components/button';
import { useState } from 'react';
import { Mail, MessageSquare, Tag, Truck, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';

export default function TabNotificationsLayout() {
  const t = useTranslations('Notifications');
  const locale = useLocale();
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promotions: false,
    newArrivals: true,
    smsAlerts: false,
    newsletter: true
  });

  const handleSave = () => {
    toast.success(t('saveSuccess'));
  };

  return (
    <div className="max-w-3xl py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-serif tracking-tight text-foreground mb-3">{t('title')}</h1>
        <p className="text-muted-foreground text-sm">
          {t('description')}
        </p>
      </div>

      <div className="space-y-6">
        <section className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-secondary/30 border-b border-border">
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">{t('orderAndDelivery')}</h2>
          </div>
          <div className="p-6 space-y-6">
            <div dir="ltr" className="flex items-center justify-between gap-6">
              <div className="flex gap-4">
                <Truck className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="font-medium text-sm text-foreground">{t('orderUpdates')}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t('orderUpdatesDesc')}</p>
                </div>
              </div>
              <Switch checked={preferences.orderUpdates} onCheckedChange={(c) => setPreferences({...preferences, orderUpdates: c})} />
            </div>
            
            <div dir="ltr" className="flex items-center justify-between gap-6">
              <div className="flex gap-4">
                <MessageSquare className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="font-medium text-sm text-foreground">{t('smsAlerts')}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t('smsAlertsDesc')}</p>
                </div>
              </div>
              <Switch checked={preferences.smsAlerts} onCheckedChange={(c) => setPreferences({...preferences, smsAlerts: c})} />
            </div>
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-secondary/30 border-b border-border">
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">{t('marketingAndPromotions')}</h2>
          </div>
          <div className="p-6 space-y-6">
            <div dir="ltr" className="flex items-center justify-between gap-6">
              <div className="flex gap-4">
                <Gift className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="font-medium text-sm text-foreground">{t('newArrivals')}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t('newArrivalsDesc')}</p>
                </div>
              </div>
              <Switch checked={preferences.newArrivals} onCheckedChange={(c) => setPreferences({...preferences, newArrivals: c})} />
            </div>

            <div dir="ltr" className="flex items-center justify-between gap-6">
              <div className="flex gap-4">
                <Tag className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="font-medium text-sm text-foreground">{t('exclusiveOffers')}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t('exclusiveOffersDesc')}</p>
                </div>
              </div>
              <Switch checked={preferences.promotions} onCheckedChange={(c) => setPreferences({...preferences, promotions: c})} />
            </div>

            <div dir="ltr" className="flex items-center justify-between gap-6">
              <div className="flex gap-4">
                <Mail className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="font-medium text-sm text-foreground">{t('newsletter')}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t('newsletterDesc')}</p>
                </div>
              </div>
              <Switch checked={preferences.newsletter} onCheckedChange={(c) => setPreferences({...preferences, newsletter: c})} />
            </div>
          </div>
        </section>

        <Button onClick={handleSave} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-medium">
          {t('savePreferences')}
        </Button>
      </div>
    </div>
  );
}
