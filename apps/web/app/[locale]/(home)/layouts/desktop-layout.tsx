export default function DesktopHomeLayout(props: any) {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <section className="container mx-auto px-4 pt-6">
        <div className="overflow-hidden rounded-xl shadow-lg">
          {props.carousel}
        </div>
      </section>

      <section className="w-full pt-16 pb-8">
        {props.shopByCategories}
      </section>

      <section className="w-full py-8">
        {props.newArrivals}
      </section>

      <section className="w-full py-12">
        {props.featuredCollections}
      </section>

      <section className="w-full py-8">
        {props.bestSellers}
      </section>

      <section className="w-full py-8">
        {props.flashSale}
      </section>

      <section className="w-full py-12">
        {props.lookbook}
      </section>

      <section className="w-full py-8">
        {props.trendingProducts}
      </section>

      <section className="w-full py-8">
        {props.featuredProducts}
      </section>

      <section className="w-full py-12">
        {props.shopByOccasion}
      </section>

      <section className="w-full py-8">
        {props.shopByPrice}
      </section>

      <section className="w-full py-8">
        {props.personalizedRecommendations}
      </section>

      <section className="w-full py-8">
        {props.recentlyViewed}
      </section>

      <section className="w-full">
        {props.customerReviews}
      </section>

      {props.whyChooseUs}
      {props.footer}
    </main>
  );
}
