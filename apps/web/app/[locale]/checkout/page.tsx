'use client';

import { useDevice } from '@/hooks/use-media-query';
import DesktopCheckoutLayout from './layouts/desktop-layout';
import MobileCheckoutLayout from './layouts/mobile-layout';
import TabLayout from './layouts/tab-layout';
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
  const { isDesktop, isTablet, isMobile } = useDevice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  if (isDesktop) return <DesktopCheckoutLayout />;
  if (isTablet) return <TabLayout />;
  return <MobileCheckoutLayout />;
}
