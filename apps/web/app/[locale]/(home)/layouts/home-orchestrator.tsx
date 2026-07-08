'use client';
import { useDevice } from '@/hooks/use-media-query';
import DesktopHomeLayout from './desktop-layout';
import MobileHomeLayout from './mobile-layout';
import TabHomeLayout from './tab-layout';
import { useEffect, useState } from 'react';

export default function HomeOrchestrator(props: { 
  carousel: React.ReactNode, 
  shopByCategories: React.ReactNode,
  featuredCollections: React.ReactNode,
  newArrivals: React.ReactNode, 
  trendingProducts: React.ReactNode,
  flashSale: React.ReactNode,
  featuredProducts: React.ReactNode,
  shopByOccasion: React.ReactNode,
  shopByPrice: React.ReactNode,
  personalizedRecommendations: React.ReactNode,
  recentlyViewed: React.ReactNode,
  lookbook: React.ReactNode, 
  whyChooseUs: React.ReactNode,
  customerReviews: React.ReactNode,
  newsletter: React.ReactNode,
  footer: React.ReactNode
}) {
  const { isDesktop, isTablet } = useDevice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-background"></div>;

  if (isDesktop) return <DesktopHomeLayout {...props} />;
  if (isTablet) return <TabHomeLayout {...props} />;
  return <MobileHomeLayout {...props} />;
}
