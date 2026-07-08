export default function TabHomeLayout(props: any) {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <section className="w-full p-4">
        <div className="overflow-hidden rounded-2xl shadow-md">
          {props.carousel}
        </div>
      </section>

      <section className="w-full pt-12 pb-6 px-6">
        {props.shopByCategories}
      </section>

      <section className="w-full py-6">
        {props.newArrivals}
      </section>

      <section className="w-full py-8">
        {props.featuredCollections}
      </section>

      <section className="w-full py-6">
        {props.bestSellers}
      </section>

      <section className="w-full py-6">
        {props.flashSale}
      </section>

      <section className="w-full py-8">
        {props.lookbook}
      </section>

      <section className="w-full py-6">
        {props.trendingProducts}
      </section>

      <section className="w-full py-6">
        {props.featuredProducts}
      </section>

      <section className="w-full py-8">
        {props.shopByOccasion}
      </section>

      <section className="w-full py-6">
        {props.shopByPrice}
      </section>

      <section className="w-full py-6">
        {props.personalizedRecommendations}
      </section>

      <section className="w-full py-6">
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
