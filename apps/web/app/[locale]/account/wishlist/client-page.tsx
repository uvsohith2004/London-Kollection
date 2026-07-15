'use client';
import { useDevice } from '@/hooks/use-media-query';
import DesktopWishlistLayout from './layouts/desktop-layout';
import TabWishlistLayout from './layouts/tab-layout';
import MobileWishlistLayout from './layouts/mobile-layout';
import { useEffect, useState } from 'react';
import { useWishlistStore } from '@/store/wishlist-store';
import { Loader2 } from 'lucide-react';

export default function AccountWishlistPage() {
  const { isDesktop, isTablet } = useDevice();
  const [mounted, setMounted] = useState(false);
  
  const items = useWishlistStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }


  if (isDesktop) return <DesktopWishlistLayout items={items} />;
  if (isTablet) return <TabWishlistLayout items={items} />;
  return <MobileWishlistLayout items={items} />;
}
