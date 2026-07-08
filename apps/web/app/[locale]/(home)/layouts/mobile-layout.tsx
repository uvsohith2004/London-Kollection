export default function MobileHomeLayout(props: any) {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <section className="w-full">
         {props.carousel}
      </section>

      <section className="w-full pt-10 pb-4">
        {props.shopByCategories}
      </section>

      <section className="w-full py-4">
        {props.newArrivals}
      </section>

      <section className="w-full py-6">
        {props.featuredCollections}
      </section>

      <section className="w-full py-4">
        {props.bestSellers}
      </section>

      <section className="w-full py-4">
        {props.flashSale}
      </section>

      <section className="w-full py-6">
        {props.lookbook}
      </section>

      <section className="w-full py-4">
        {props.trendingProducts}
      </section>

      <section className="w-full py-4">
        {props.featuredProducts}
      </section>

      <section className="w-full py-6">
        {props.shopByOccasion}
      </section>

      <section className="w-full py-4">
        {props.shopByPrice}
      </section>

      <section className="w-full py-4">
        {props.personalizedRecommendations}
      </section>

      <section className="w-full py-4">
        {props.recentlyViewed}
      </section>

      <section className="w-full">
        {props.customerReviews}
      </section>

      {props.whyChooseUs}
      {props.newsletter}
      {props.footer}
    </main>
  );
}
