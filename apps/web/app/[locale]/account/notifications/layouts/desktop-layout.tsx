'use client';
import { Switch } from '@workspace/ui/components/switch';
import { Button } from '@workspace/ui/components/button';
import { useState } from 'react';
import { Mail, MessageSquare, Tag, Truck, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';

export default function DesktopNotificationsLayout() {
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
    <div className="max-w-4xl py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-serif tracking-tight text-foreground mb-3">{t('title')}</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          {t('description')}
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-8 py-5 bg-secondary/30 border-b border-border">
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">{t('orderAndDelivery')}</h2>
          </div>
          <div className="p-8 space-y-6">
            <div dir="ltr" className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-foreground" />
                </div>
                <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="font-medium text-foreground">{t('orderUpdates')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('orderUpdatesDesc')}</p>
                </div>
              </div>
              <Switch checked={preferences.orderUpdates} onCheckedChange={(c) => setPreferences({...preferences, orderUpdates: c})} />
            </div>
            
            <div dir="ltr" className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-foreground" />
                </div>
                <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="font-medium text-foreground">{t('smsAlerts')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('smsAlertsDesc')}</p>
                </div>
              </div>
              <Switch checked={preferences.smsAlerts} onCheckedChange={(c) => setPreferences({...preferences, smsAlerts: c})} />
            </div>
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-8 py-5 bg-secondary/30 border-b border-border">
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">{t('marketingAndPromotions')}</h2>
          </div>
          <div className="p-8 space-y-6">
            <div dir="ltr" className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-foreground" />
                </div>
                <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="font-medium text-foreground">{t('newArrivals')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('newArrivalsDesc')}</p>
                </div>
              </div>
              <Switch checked={preferences.newArrivals} onCheckedChange={(c) => setPreferences({...preferences, newArrivals: c})} />
            </div>

            <div dir="ltr" className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-foreground" />
                </div>
                <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="font-medium text-foreground">{t('exclusiveOffers')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('exclusiveOffersDesc')}</p>
                </div>
              </div>
              <Switch checked={preferences.promotions} onCheckedChange={(c) => setPreferences({...preferences, promotions: c})} />
            </div>

            <div dir="ltr" className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-foreground" />
                </div>
                <div className="ltr:ml-0 rtl:mr-0 text-left" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                  <h3 className="font-medium text-foreground">{t('newsletter')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('newsletterDesc')}</p>
                </div>
              </div>
              <Switch checked={preferences.newsletter} onCheckedChange={(c) => setPreferences({...preferences, newsletter: c})} />
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 rounded-xl font-medium tracking-wide">
            {t('savePreferences')}
          </Button>
        </div>
      </div>
    </div>
  );
}
