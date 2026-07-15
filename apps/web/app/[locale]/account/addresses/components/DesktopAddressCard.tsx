import { Building2, Home, Phone, ShieldCheck } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { getTranslations } from "next-intl/server"
import { AddressDetails } from "./AddressDetails"
import { EditAddressButton } from "./EditAddressButton"
import { DeleteAddressButton } from "./DeleteAddressButton"
import { DefaultAddressButton } from "./DefaultAddressButton"

export async function DesktopAddressCard({ address }: { address: any }) {
  const t = await getTranslations("Addresses")

  return (
    <div dir="ltr" className={cn(
      "group relative p-8 rounded-2xl border transition-all duration-300 flex flex-col h-full overflow-hidden",
      address.default ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-border/80"
    )}>
      {address.default && (
        <div className="absolute top-0 right-0 bg-foreground text-background px-4 py-1.5 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider flex items-center shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> {t("defaultBadge")}
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="font-serif text-2xl mb-1 text-foreground flex items-center gap-2">
          {address.type === 'billing' ? <Building2 className="w-5 h-5 text-muted-foreground" /> : <Home className="w-5 h-5 text-muted-foreground" />}
          {address.name}
        </h3>
        
        <div className="flex items-center gap-2 mt-4 text-foreground text-sm font-medium bg-secondary w-fit px-3 py-1.5 rounded-md border border-border/50">
          <Phone className="w-4 h-4 text-muted-foreground" />
          {address.phone}
        </div>
      </div>

      <AddressDetails address={address} />

      <div className="flex items-center justify-between mt-8 pt-5 border-t border-border/40">
        <div className="flex gap-3">
          <EditAddressButton addressId={address.id} className="rounded-full px-6 h-9 border-border hover:bg-secondary/50 text-xs" />
          <DeleteAddressButton addressId={address.id} className="rounded-full w-9 p-0 border-border text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" />
        </div>
        {!address.default && (
          <DefaultAddressButton addressId={address.id} addressType={address.type} className="text-xs text-muted-foreground hover:text-foreground border-none" />
        )}
      </div>
    </div>
  )
}
