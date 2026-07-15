import { serverApi } from '@/api-client/server';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ReviewFormClient } from './review-form-client';
import { OptimizedImage } from '@/components/optimized-image';

export default async function ReviewPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string; reviewId: string; locale: string }>;
  searchParams: Promise<{ rating?: string }>;
}) {
  const { id: orderId, reviewId } = await params;
  const { rating: queryRating } = await searchParams;

  let reviewData;
  try {
    const res = await serverApi.get(`/reviews/${reviewId}/form`);
    reviewData = res?.review;
  } catch (error) {
    console.error("Failed to fetch review draft", error);
    notFound();
  }

  if (!reviewData) {
    notFound();
  }

  const { product, rating, title: reviewTitle, comment: reviewComment, isPublished } = reviewData;
  
  const title = product?.title || 'Product';
  const image = product?.images?.find((img: any) => img.isPrimary)?.asset || product?.images?.[0]?.asset;

  return (
    <div className="max-w-3xl py-8 space-y-8 animate-in fade-in duration-500">
      <Link
        href={`/account/orders/${orderId}` as any}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Order
      </Link>
      
      <div className="flex items-center gap-6 pb-6 border-b">
        {image && (
          <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
            <OptimizedImage
              asset={image}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-serif tracking-tight text-foreground">Write a Review</h1>
          <p className="text-muted-foreground mt-1">{title}</p>
        </div>
      </div>

      <ReviewFormClient 
        reviewId={reviewId} 
        orderId={orderId}
        initialRating={rating || parseInt(queryRating || '0')}
        initialComment={reviewComment}
        isPublished={isPublished}
      />
    </div>
  );
}
