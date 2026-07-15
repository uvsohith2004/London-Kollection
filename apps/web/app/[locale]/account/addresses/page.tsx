import { serverApi } from "@/api-client/server";
import { AddressHeader } from "./components/AddressHeader";
import { AddressList } from "./components/AddressList";
import { AddressFormContainer } from "./components/AddressFormContainer";
import { Button } from "@workspace/ui/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function AccountAddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; id?: string }>;
}) {
  const t = await getTranslations("Addresses");
  const params = await searchParams;
  const isEditing = params.action === "edit";
  const isAdding = params.action === "add";
  const showForm = isEditing || isAdding;

  let addresses: any[] = [];
  try {
    addresses = await serverApi.get("/fulfillment/addresses");
  } catch (error) {
    console.error("Failed to fetch addresses on server:", error);
  }

  const selectedAddress = isEditing
    ? addresses.find((a: any) => a.id === params.id)
    : undefined;

  return (
    <div className="max-w-5xl bg-background min-h-screen text-foreground pb-20 md:px-4 lg:px-0">
      <AddressHeader hideAddButton={showForm} />

      {showForm ? (
        <AddressFormContainer address={selectedAddress} />
      ) : (
        <AddressList addresses={addresses} />
      )}


      {!showForm && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border z-10 md:hidden pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Link href="?action=add">
            <Button className="w-full h-14 rounded-xl shadow-lg font-medium text-sm uppercase tracking-widest text-background bg-foreground flex items-center justify-center">
              <Plus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
              {t("addNew")}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
