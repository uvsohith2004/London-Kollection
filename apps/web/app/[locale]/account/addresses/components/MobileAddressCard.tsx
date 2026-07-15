import { Building2, Home, Phone, ShieldCheck } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { getTranslations } from "next-intl/server"
import { AddressDetails } from "./AddressDetails"
import { EditAddressButton } from "./EditAddressButton"
import { DeleteAddressButton } from "./DeleteAddressButton"
import { DefaultAddressButton } from "./DefaultAddressButton"

export async function MobileAddressCard({ address }: { address: any }) {
  const t = await getTranslations("Addresses")

  return (
    <div dir="ltr" className={cn(
      "p-5 rounded-2xl border transition-all relative overflow-hidden h-full flex flex-col",
      address.default ? "border-primary bg-primary/5" : "border-border bg-card"
    )}>
      {address.default && (
        <div className="absolute top-0 right-0 bg-foreground text-background px-3 py-1 rounded-bl-lg text-[9px] font-bold uppercase tracking-wider flex items-center shadow-sm">
          <ShieldCheck className="w-3 h-3 mr-1" /> {t("defaultBadge")}
        </div>
      )}

      <div className="flex justify-between items-start mb-4 pr-16">
        <div className="flex items-center gap-2">
          {address.type === 'billing' ? <Building2 className="w-4 h-4 text-muted-foreground" /> : <Home className="w-4 h-4 text-muted-foreground" />}
          <h3 className="font-semibold text-base">{address.name}</h3>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-foreground text-sm font-medium bg-secondary/60 w-fit px-2.5 py-1 rounded-lg border border-border/50">
        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
        {address.phone}
      </div>

      <AddressDetails address={address} />

      <div className="flex gap-2 mt-auto pt-4">
        <EditAddressButton addressId={address.id} className="flex-1 h-10 rounded-xl bg-secondary/80 text-xs font-medium" />
        {!address.default && (
          <DefaultAddressButton addressId={address.id} addressType={address.type} className="flex-1 h-10 rounded-xl border-border text-xs font-medium" />
        )}
        <DeleteAddressButton addressId={address.id} className="w-10 h-10 p-0 rounded-xl border-border text-destructive hover:bg-destructive/10" />
      </div>
    </div>
  )
}
