import { MapPin } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { AddressCard } from "./AddressCard"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export async function AddressList({ addresses }: { addresses: any[] }) {
  const t = await getTranslations("Addresses")

  if (addresses.length === 0) {
    return (
      <div className="text-center py-16 md:py-24 rounded-2xl bg-card border border-border shadow-sm">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
          <MapPin className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg md:text-xl font-medium mb-1 md:mb-2 text-foreground">{t("noAddresses")}</h3>
        <p className="text-muted-foreground mb-6 md:mb-8 text-sm">{t("noAddressesDesc")}</p>
        <Link href="?action=add">
          <Button variant="outline" className="rounded-full px-6 md:px-8 uppercase tracking-widest text-xs border-border">
            {t("addFirst")}
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
      {addresses.map((addr) => (
        <AddressCard key={addr.id} address={addr} />
      ))}
    </div>
  )
}
