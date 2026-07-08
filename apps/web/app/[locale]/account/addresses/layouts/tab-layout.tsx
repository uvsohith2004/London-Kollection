import { Button } from "@workspace/ui/components/button"
import { Plus, MapPin, Phone, ShieldCheck, Home, Building2, Trash2, Edit3 } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { AddressForm } from "@/components/address-form/index"
import { useTranslations } from "next-intl"

export default function TabAddressesLayout({ 
  addresses, onAdd, onEdit, onDelete, onSetDefault, 
  isEditingAddress, editingAddressData, handleFormSuccess, handleCloseForm 
}: any) {
  const t = useTranslations("Addresses")
  return (
    <div className="max-w-2xl pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif tracking-tight mb-1 text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground text-sm font-light">{t("description")}</p>
        </div>
        {!isEditingAddress && (
          <Button onClick={onAdd} size="sm" className="h-9 px-5 rounded-full uppercase tracking-widest text-[10px] font-semibold">
            <Plus className="w-3.5 h-3.5 ltr:mr-1.5 rtl:ml-1.5" />
            {t("addNew")}
          </Button>
        )}
      </div>

      {isEditingAddress && (
        <div className="mb-8 bg-card p-6 rounded-2xl border border-border shadow-sm animate-in slide-in-from-bottom-4 duration-300">
          <div className="mb-5 border-b border-border/40 pb-4">
            <h2 className="text-lg font-medium text-foreground">{editingAddressData ? t("edit") : t("addNew")}</h2>
          </div>
          <AddressForm 
            address={editingAddressData} 
            onSuccess={handleFormSuccess} 
            onCancel={handleCloseForm} 
          />
        </div>
      )}

      {!isEditingAddress && addresses.length === 0 && (
        <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">{t("noAddresses")}</h3>
          <p className="text-sm text-muted-foreground mb-6">{t("noAddressesDesc")}</p>
          <Button onClick={onAdd} variant="outline" size="sm" className="rounded-full px-6 border-border text-xs">{t("addFirst")}</Button>
        </div>
      )}

      {!isEditingAddress && addresses.length > 0 && (
        <div className="grid grid-cols-1 gap-5">
          {addresses.map((addr: any) => (
            <div key={addr.id} dir="ltr" className={cn(
              "relative p-6 rounded-2xl border transition-all flex flex-col overflow-hidden",
              addr.default ? "border-primary bg-primary/5" : "border-border bg-card"
            )}>
              {addr.default && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg text-[9px] font-bold uppercase tracking-wider flex items-center shadow-sm">
                  <ShieldCheck className="w-3 h-3 mr-1" /> {t("defaultBadge")}
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-lg text-foreground flex items-center gap-2">
                    {addr.type === 'billing' ? <Building2 className="w-4 h-4 text-muted-foreground" /> : <Home className="w-4 h-4 text-muted-foreground" />}
                    {addr.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-foreground text-xs font-medium bg-secondary/50 w-fit px-2 py-1 rounded border border-border/50">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    {addr.phone}
                  </div>
                </div>
              </div>

              <div className="text-muted-foreground text-sm space-y-1 mb-5">
                <p className="text-foreground font-medium">{addr.addressLine1}</p>
                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                <p>{addr.city}, {addr.state} {addr.postalCode !== "00000" && addr.postalCode}</p>
                <p>{addr.country}</p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                <Button variant="secondary" size="sm" onClick={() => onEdit(addr)} className="h-9 px-5 rounded-lg text-xs">
                  <Edit3 className="w-3.5 h-3.5 mr-2" /> {t("editBtn")}
                </Button>
                {!addr.default && (
                  <Button variant="outline" size="sm" onClick={() => onSetDefault(addr.id, addr.type)} className="h-9 rounded-lg border-border text-xs">
                    {t("setDefault")}
                  </Button>
                )}
                <div className="flex-1" />
                <Button variant="ghost" size="sm" onClick={() => onDelete(addr.id)} className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
