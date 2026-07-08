import Image from "next/image";
import Link from "next/link";
import { Star, MessageSquare, Edit3, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslations, useLocale } from 'next-intl';

export default function TabReviewsLayout({ reviews }: { reviews: any[] }) {
  const t = useTranslations('Reviews');
  const locale = useLocale();

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border shadow-sm">
        <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="w-6 h-6 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-medium mb-2 text-foreground">{t('noReviews')}</h2>
        <p className="text-muted-foreground mb-6 text-sm text-center px-4">
          {t('noReviewsDesc')}
        </p>
        <Button className="rounded-full px-6 uppercase tracking-widest text-xs font-semibold">
          <Link href={`/${locale}/account/orders`}>{t('reviewPastPurchases')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} dir="ltr" className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-6 text-left">
            <div className="flex gap-6 mb-6">
              <Link href={`/${locale}/products/${review.productId}`} className="shrink-0">
                <div className="relative w-24 aspect-[3/4] bg-secondary rounded-lg overflow-hidden">
                  {review.productImage ? (
                    <Image
                      src={review.productImage}
                      alt={review.productName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">{t('noImage')}</div>
                  )}
                </div>
              </Link>
              
              <div className="flex-1 ltr:ml-0 rtl:mr-0">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/${locale}/products/${review.productId}`} className="hover:underline">
                    <h3 className="font-medium text-foreground tracking-tight">{review.productName}</h3>
                  </Link>
                  <span className={cn(
                    "text-[10px] uppercase tracking-widest px-2 py-1 rounded-full",
                    review.status === 'published' ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                  )}>
                    {review.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-3 w-3",
                        star <= review.rating ? "fill-foreground text-foreground" : "fill-transparent text-muted-foreground/40"
                      )}
                    />
                  ))}
                </div>
                <time className="text-[10px] tracking-widest text-muted-foreground uppercase">
                  {new Date(review.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-KW' : 'en-US')}
                </time>
              </div>
            </div>
            
            <p className="text-sm leading-relaxed text-muted-foreground mb-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              {review.comment}
            </p>

            <div className="flex gap-3 border-t border-border pt-4">
              <Button variant="outline" size="sm" className="flex-1 rounded-xl border-border">
                <Edit3 className="w-4 h-4 mr-2" />
                {t('edit')}
              </Button>
              <Button variant="outline" size="sm" className="flex-1 rounded-xl border-border text-destructive hover:text-destructive hover:bg-destructive/10">
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
