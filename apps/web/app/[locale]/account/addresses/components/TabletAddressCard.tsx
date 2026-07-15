import { Building2, Home, Phone, ShieldCheck } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { getTranslations } from "next-intl/server"
import { AddressDetails } from "./AddressDetails"
import { EditAddressButton } from "./EditAddressButton"
import { DeleteAddressButton } from "./DeleteAddressButton"
import { DefaultAddressButton } from "./DefaultAddressButton"

export async function TabletAddressCard({ address }: { address: any }) {
  const t = await getTranslations("Addresses")

  return (
    <div dir="ltr" className={cn(
      "relative p-6 rounded-2xl border transition-all flex flex-col h-full overflow-hidden",
      address.default ? "border-primary bg-primary/5" : "border-border bg-card"
    )}>
      {address.default && (
        <div className="absolute top-0 right-0 bg-foreground text-background px-3 py-1 rounded-bl-lg text-[9px] font-bold uppercase tracking-wider flex items-center shadow-sm">
          <ShieldCheck className="w-3 h-3 mr-1" /> {t("defaultBadge")}
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium text-lg text-foreground flex items-center gap-2">
            {address.type === 'billing' ? <Building2 className="w-4 h-4 text-muted-foreground" /> : <Home className="w-4 h-4 text-muted-foreground" />}
            {address.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-2 text-foreground text-xs font-medium bg-secondary/50 w-fit px-2 py-1 rounded border border-border/50">
            <Phone className="w-3 h-3 text-muted-foreground" />
            {address.phone}
          </div>
        </div>
      </div>

      <AddressDetails address={address} />

      <div className="flex items-center gap-2 pt-4 border-t border-border/50">
        <EditAddressButton addressId={address.id} className="h-9 px-5 rounded-lg text-xs" />
        {!address.default && (
          <DefaultAddressButton addressId={address.id} addressType={address.type} className="h-9 rounded-lg border-border text-xs" />
        )}
        <div className="flex-1" />
        <DeleteAddressButton addressId={address.id} className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" />
      </div>
    </div>
  )
}
