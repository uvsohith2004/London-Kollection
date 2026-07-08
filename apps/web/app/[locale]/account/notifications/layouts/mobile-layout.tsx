'use client';
import { Switch } from '@workspace/ui/components/switch';
import { Button } from '@workspace/ui/components/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';

export default function MobileNotificationsLayout() {
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
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <h1 className="text-2xl font-serif tracking-tight text-foreground mb-6">{t('title')}</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">{t('orderAndDelivery')}</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div dir="ltr" className="p-4 flex items-center justify-between">
              <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <h3 className="font-medium text-sm text-foreground">{t('orderUpdates')}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('orderUpdatesDesc')}</p>
              </div>
              <Switch checked={preferences.orderUpdates} onCheckedChange={(c) => setPreferences({...preferences, orderUpdates: c})} size="sm" />
            </div>
            <div className="h-px bg-border ml-4" />
            <div dir="ltr" className="p-4 flex items-center justify-between">
              <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <h3 className="font-medium text-sm text-foreground">{t('smsAlerts')}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('smsAlertsDesc')}</p>
              </div>
              <Switch checked={preferences.smsAlerts} onCheckedChange={(c) => setPreferences({...preferences, smsAlerts: c})} size="sm" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">{t('marketingAndPromotions')}</h2>
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div dir="ltr" className="p-4 flex items-center justify-between">
              <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <h3 className="font-medium text-sm text-foreground">{t('newArrivals')}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('newArrivalsDesc')}</p>
              </div>
              <Switch checked={preferences.newArrivals} onCheckedChange={(c) => setPreferences({...preferences, newArrivals: c})} size="sm" />
            </div>
            <div className="h-px bg-border ml-4" />
            <div dir="ltr" className="p-4 flex items-center justify-between">
              <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <h3 className="font-medium text-sm text-foreground">{t('exclusiveOffers')}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('exclusiveOffersDesc')}</p>
              </div>
              <Switch checked={preferences.promotions} onCheckedChange={(c) => setPreferences({...preferences, promotions: c})} size="sm" />
            </div>
            <div className="h-px bg-border ml-4" />
            <div dir="ltr" className="p-4 flex items-center justify-between">
              <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <h3 className="font-medium text-sm text-foreground">{t('newsletter')}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t('newsletterDesc')}</p>
              </div>
              <Switch checked={preferences.newsletter} onCheckedChange={(c) => setPreferences({...preferences, newsletter: c})} size="sm" />
            </div>
          </div>
        </section>

        <div className="pt-4">
          <Button onClick={handleSave} className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-medium tracking-wide">
            {t('savePreferences')}
          </Button>
        </div>
      </div>
    </div>
  );
}
