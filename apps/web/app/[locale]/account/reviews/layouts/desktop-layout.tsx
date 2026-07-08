import Image from "next/image";
import Link from "next/link";
import { Star, MessageSquare, ArrowRight, Edit3, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslations, useLocale } from 'next-intl';

export default function DesktopReviewsLayout({ reviews }: { reviews: any[] }) {
  const t = useTranslations('Reviews');
  const locale = useLocale();

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-card rounded-2xl border border-border">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium mb-2 text-foreground">{t('noReviews')}</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          {t('noReviewsDesc')}
        </p>
        <Button className="rounded-full px-8 uppercase tracking-widest text-xs font-semibold">
          <Link href={`/${locale}/account/orders`}>{t('reviewPastPurchases')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif tracking-tight text-foreground">{t('title')}</h1>
      </div>
      {reviews.map((review) => (
        <div key={review.id} dir="ltr" className="group flex bg-card hover:bg-secondary/20 p-8 rounded-2xl border border-border transition-all duration-300 gap-8">
          <div className="shrink-0">
            <Link href={`/${locale}/products/${review.productId}`}>
              <div className="relative w-32 aspect-[3/4] overflow-hidden bg-secondary rounded-lg">
                {review.productImage ? (
                  <Image
                    src={review.productImage}
                    alt={review.productName}
                    fill
                    className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">{t('noImage')}</div>
                )}
              </div>
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col justify-between ltr:ml-0 rtl:mr-0 text-left">
            <div>
              <div className="flex items-start justify-between mb-2">
                <Link href={`/${locale}/products/${review.productId}`} className="hover:underline underline-offset-4">
                  <h3 className="font-medium text-lg text-foreground tracking-tight">{review.productName}</h3>
                </Link>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium text-foreground">
                  <span className="capitalize">{review.status}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        star <= review.rating ? "fill-foreground text-foreground" : "fill-transparent text-muted-foreground/40"
                      )}
                    />
                  ))}
                </div>
                <time className="text-xs tracking-widest text-muted-foreground uppercase">
                  {new Date(review.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground max-w-2xl" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {review.comment}
              </p>
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="outline" size="sm" className="rounded-full border-border">
                <Edit3 className="w-4 h-4 mr-2" />
                {t('edit')}
              </Button>
              <Button variant="outline" size="sm" className="rounded-full border-border text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4 mr-2" />
                {t('delete')}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
