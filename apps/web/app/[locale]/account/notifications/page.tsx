'use client';
import { useDevice } from '@/hooks/use-media-query';
import DesktopNotificationsLayout from './layouts/desktop-layout';
import TabNotificationsLayout from './layouts/tab-layout';
import MobileNotificationsLayout from './layouts/mobile-layout';
import { useState, useEffect } from 'react';

export default function AccountNotificationsPage() {
  const { isMobile, isTablet, isDesktop } = useDevice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isDesktop) return <DesktopNotificationsLayout />;
  if (isTablet) return <TabNotificationsLayout />;
  return <MobileNotificationsLayout />;
}
