import { serverApi } from "@/api-client/server";
import { ProductsTab } from "./components/products-tab";

export default async function AdminProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === 'string' ? searchParams.q : "";
  const query = new URLSearchParams();
  if (q) query.set("q", q);
  query.set("limit", "20");
  query.set("offset", "0");
  
  const initialData = await serverApi.get(`/admin/products?${query.toString()}`).catch(() => []);

  return (
    <div className="space-y-12 w-full  font-sans">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-heading text-4xl font-light tracking-tight text-foreground uppercase">
            Products
          </h2>
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            Inventory Management
          </p>
        </div>
      </div>

      <div className="animate-in fade-in duration-500 w-full">
        <ProductsTab initialData={initialData} initialQuery={q} />
      </div>
    </div>
  );
}
