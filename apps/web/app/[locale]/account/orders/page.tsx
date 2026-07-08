'use client';
import { useDevice } from '@/hooks/use-media-query';
import DesktopOrdersLayout from './layouts/desktop-layout';
import TabOrdersLayout from './layouts/tab-layout';
import MobileOrdersLayout from './layouts/mobile-layout';
import { useEffect, useState } from 'react';
import { useUserOrdersQuery } from './services/queries';

export default function AccountOrdersPage() {
  const { isDesktop, isTablet } = useDevice();
  const [mounted, setMounted] = useState(false);
  const { data: orders = [], isLoading } = useUserOrdersQuery();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

  if (isDesktop) return <DesktopOrdersLayout orders={orders} />;
  if (isTablet) return <TabOrdersLayout orders={orders} />;
  return <MobileOrdersLayout orders={orders} />;
}
