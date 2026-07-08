import { Button } from "@workspace/ui/components/button"
import { Plus, MapPin, Phone, CheckCircle2, Home, Building2, Trash2, Edit3, ShieldCheck } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { AddressForm } from "@/components/address-form/index"
import { useTranslations } from "next-intl"

export default function DesktopAddressesLayout({ 
  addresses, onAdd, onEdit, onDelete, onSetDefault, 
  isEditingAddress, editingAddressData, handleFormSuccess, handleCloseForm 
}: any) {
  const t = useTranslations("Addresses")
  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex items-center justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight mb-2 text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground font-light text-sm">{t("description")}</p>
        </div>
        {!isEditingAddress && (
          <Button onClick={onAdd} className="h-11 px-8 rounded-full uppercase tracking-widest text-[11px] font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all">
            <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            {t("addNew")}
          </Button>
        )}
      </div>

      {isEditingAddress && (
        <div className="mb-12 bg-card p-8 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-foreground">{editingAddressData ? t("edit") : t("addNew")}</h2>
            <p className="text-sm text-muted-foreground">{t("formDesc")}</p>
          </div>
          <AddressForm 
            address={editingAddressData} 
            onSuccess={handleFormSuccess} 
            onCancel={handleCloseForm} 
          />
        </div>
      )}

      {!isEditingAddress && addresses.length === 0 && (
        <div className="text-center py-24 rounded-2xl bg-card border border-border">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2 text-foreground">{t("noAddresses")}</h3>
          <p className="text-muted-foreground mb-8 text-sm">{t("noAddressesDesc")}</p>
          <Button onClick={onAdd} variant="outline" className="rounded-full px-8 uppercase tracking-widest text-xs border-border">{t("addFirst")}</Button>
        </div>
      )}

      {!isEditingAddress && addresses.length > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {addresses.map((addr: any) => (
            <div key={addr.id} dir="ltr" className={cn(
              "group relative p-8 rounded-2xl border transition-all duration-300 flex flex-col h-full overflow-hidden",
              addr.default ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:border-border/80"
            )}>
              {addr.default && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider flex items-center shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> {t("defaultBadge")}
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="font-serif text-2xl mb-1 text-foreground flex items-center gap-2">
                  {addr.type === 'billing' ? <Building2 className="w-5 h-5 text-muted-foreground" /> : <Home className="w-5 h-5 text-muted-foreground" />}
                  {addr.name}
                </h3>
                
                <div className="flex items-center gap-2 mt-4 text-foreground text-sm font-medium bg-secondary w-fit px-3 py-1.5 rounded-md border border-border/50">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {addr.phone}
                </div>
              </div>

              <div className="text-muted-foreground text-sm space-y-1.5 flex-1 leading-relaxed">
                <p className="text-foreground font-medium text-base">{addr.addressLine1}</p>
                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                <p>{addr.city}, {addr.state}</p>
                <p>{addr.country} {addr.postalCode && addr.postalCode !== "00000" && `- ${addr.postalCode}`}</p>
                {addr.landmark && <p className="italic text-xs mt-3 opacity-80 before:content-['•'] ltr:before:mr-2 rtl:before:ml-2">{t("landmarkPrefix")} {addr.landmark}</p>}
              </div>

              <div className="flex items-center justify-between mt-8 pt-5 border-t border-border/40">
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => onEdit(addr)} className="rounded-full px-6 h-9 border-border hover:bg-secondary/50 text-xs">
                    <Edit3 className="w-3.5 h-3.5 mr-2" /> {t("editBtn")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(addr.id)} className="rounded-full w-9 p-0 border-border text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {!addr.default && (
                  <Button variant="ghost" size="sm" onClick={() => onSetDefault(addr.id, addr.type)} className="text-xs text-muted-foreground hover:text-foreground">
                    {t("setDefault")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
