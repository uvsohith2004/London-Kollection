'use client';
import { useDevice } from '@/hooks/use-media-query';
import DesktopOrderDetailLayout from './layouts/desktop-layout';
import TabOrderDetailLayout from './layouts/tab-layout';
import MobileOrderDetailLayout from './layouts/mobile-layout';
import { useEffect, useState, use } from 'react';
import { useOrderDetailsQuery } from './services/queries';

export default function AccountOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isDesktop, isTablet } = useDevice();
  const [mounted, setMounted] = useState(false);
  const { data: order, isLoading } = useOrderDetailsQuery(id);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

  if (!order) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Order not found</div>;

  if (isDesktop) return <DesktopOrderDetailLayout order={order} />;
  if (isTablet) return <TabOrderDetailLayout order={order} />;
  return <MobileOrderDetailLayout order={order} />;
}
