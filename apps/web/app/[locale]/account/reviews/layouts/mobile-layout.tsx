import Image from "next/image";
import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslations, useLocale } from 'next-intl';

export default function MobileReviewsLayout({ reviews }: { reviews: any[] }) {
  const t = useTranslations('Reviews');
  const locale = useLocale();

  if (!reviews || reviews.length === 0) {
    return (
      <div className="min-h-screen bg-background px-4 py-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-card border border-border shadow-sm rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium mb-3 text-foreground">{t('noReviews')}</h2>
        <p className="text-muted-foreground text-sm mb-8 px-4">
          {t('noReviewsDesc')}
        </p>
        <Button className="w-full max-w-[200px] h-12 rounded-xl font-medium">
          <Link href={`/${locale}/account/orders`}>{t('reviewPastPurchases')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-24">
      <h1 className="text-xl font-medium mb-6">{t('title')}</h1>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} dir="ltr" className="bg-card border border-border rounded-2xl p-4 shadow-sm text-left">
            <div className="flex gap-4 mb-4">
              <Link href={`/${locale}/products/${review.productId}`} className="shrink-0">
                <div className="relative w-20 aspect-[3/4] bg-secondary rounded-lg overflow-hidden">
                  {review.productImage ? (
                    <Image src={review.productImage} alt={review.productName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">{t('noImage')}</div>
                  )}
                </div>
              </Link>
              <div className="flex-1 pt-1 ltr:ml-0 rtl:mr-0">
                <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-snug mb-1">{review.productName}</h3>
                <span className={cn(
                  "inline-block text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full mb-2",
                  review.status === 'published' ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                )}>
                  {review.status}
                </span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={cn("h-3 w-3", star <= review.rating ? "fill-foreground text-foreground" : "fill-transparent text-muted-foreground/40")} />
                  ))}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              {review.comment}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="w-full h-10 rounded-xl bg-card border-border text-xs">
                {t('edit')}
              </Button>
              <Button variant="outline" size="sm" className="w-full h-10 rounded-xl bg-card border-border text-destructive hover:bg-destructive/10 text-xs">
                {t('delete')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
