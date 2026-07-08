export default async function CollectionDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div>
      <h1>Collection: {slug}</h1>
    </div>
  );
}
