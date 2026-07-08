'use client';
import { useDevice } from '@/hooks/use-media-query';
import DesktopReviewsLayout from './layouts/desktop-layout';
import TabReviewsLayout from './layouts/tab-layout';
import MobileReviewsLayout from './layouts/mobile-layout';
import { useEffect, useState } from 'react';
import { useUserReviewsQuery } from './services/queries';
import { Loader2 } from 'lucide-react';

export default function AccountReviewsPage() {
  const { isDesktop, isTablet } = useDevice();
  const [mounted, setMounted] = useState(false);
  const { data: reviews = [], isLoading, isError } = useUserReviewsQuery();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground">
          We encountered an issue loading your reviews. Please try again later.
        </p>
      </div>
    );
  }

  if (isDesktop) return <DesktopReviewsLayout reviews={reviews} />;
  if (isTablet) return <TabReviewsLayout reviews={reviews} />;
  return <MobileReviewsLayout reviews={reviews} />;
}
