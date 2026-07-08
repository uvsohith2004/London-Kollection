'use client';
import { useDevice } from '@/hooks/use-media-query';
import DesktopWishlistLayout from './layouts/desktop-layout';
import TabWishlistLayout from './layouts/tab-layout';
import MobileWishlistLayout from './layouts/mobile-layout';
import { useEffect, useState } from 'react';
import { useWishlistQuery } from './services/queries';
import { Loader2 } from 'lucide-react';

export default function AccountWishlistPage() {
  const { isDesktop, isTablet } = useDevice();
  const [mounted, setMounted] = useState(false);
  
  // Using the new API-backed queries based on architecture rules
  const { data: items = [], isLoading, isError } = useWishlistQuery();

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
          We encountered an issue loading your wishlist. Please try again later.
        </p>
      </div>
    );
  }

  if (isDesktop) return <DesktopWishlistLayout items={items} />;
  if (isTablet) return <TabWishlistLayout items={items} />;
  return <MobileWishlistLayout items={items} />;
}
