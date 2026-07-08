import HomeOrchestrator from "./layouts/home-orchestrator"
import { HomeCarousel } from "./components/carousel/hero-carousel"
import { HomeBentoCollections } from "./components/collections"
import { HomeFeaturedCollections } from "./components/featured/featured-collections"
import { HomeNewArrivals } from "./components/new-arrivals"

import { HomeTrendingProducts } from "./components/trending"
import { HomeFlashSale } from "./components/flash-sale/flash-sale"
import { HomeFeaturedProducts } from "./components/featured/featured-products"
import { HomeShopByOccasion } from "./components/shopby/shop-by-occasion"
import { HomeShopByPrice } from "./components/shopby/shop-by-price"
import { HomePersonalizedRecommendations } from "./components/recomendations"
import { HomeRecentlyViewed } from "./components/recently-viewed"
import { HomeLookbook } from "./components/home-lookbook"
import { HomeBrandValues } from "./components/motto/brand-values"
import { HomeCustomerReviews } from "./components/reviews"
import { HomeNewsletter } from "./components/newsletter/newsletter"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <HomeOrchestrator
      carousel={<HomeCarousel />}
      shopByCategories={<HomeBentoCollections />}
      featuredCollections={<HomeFeaturedCollections />}
      newArrivals={<HomeNewArrivals />}
      trendingProducts={<HomeTrendingProducts />}
      flashSale={<HomeFlashSale />}
      featuredProducts={<HomeFeaturedProducts />}
      shopByOccasion={<HomeShopByOccasion />}
      shopByPrice={<HomeShopByPrice />}
      personalizedRecommendations={<HomePersonalizedRecommendations />}
      recentlyViewed={<HomeRecentlyViewed />}
      lookbook={<HomeLookbook />}
      whyChooseUs={<HomeBrandValues />}
      customerReviews={<HomeCustomerReviews />}
      newsletter={<HomeNewsletter />}
      footer={<Footer />}
    />
  )
}
