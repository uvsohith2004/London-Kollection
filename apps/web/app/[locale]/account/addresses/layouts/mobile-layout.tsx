import { Button } from "@workspace/ui/components/button"
import { Plus, MapPin, Phone, ShieldCheck, Home, Building2, Trash2, Edit3 } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { AddressForm } from "@/components/address-form/index"
import { useTranslations } from "next-intl"

export default function MobileAddressesLayout({ 
  addresses, onAdd, onEdit, onDelete, onSetDefault, 
  isEditingAddress, editingAddressData, handleFormSuccess, handleCloseForm 
}: any) {
  const t = useTranslations("Addresses")
  return (
    <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] text-foreground px-4">
      <div className="mb-6 pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif tracking-tight mb-1 text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      {isEditingAddress ? (
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm mb-4 animate-in fade-in slide-in-from-bottom-8">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-foreground">{editingAddressData ? t("edit") : t("addNew")}</h2>
          </div>
          <AddressForm 
            address={editingAddressData} 
            onSuccess={handleFormSuccess} 
            onCancel={handleCloseForm} 
          />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.length === 0 ? (
            <div className="text-center py-16 border border-border rounded-2xl bg-card">
              <MapPin className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-medium mb-1">{t("noAddresses")}</h3>
              <p className="text-sm text-muted-foreground">{t("noAddressesDesc")}</p>
            </div>
          ) : (
            addresses.map((addr: any) => (
              <div key={addr.id} dir="ltr" className={cn(
                "p-5 rounded-2xl border transition-all relative overflow-hidden",
                addr.default ? "border-primary bg-primary/5" : "border-border bg-card"
              )}>
                {addr.default && (
                  <div className="absolute top-0 right-0 bg-foreground text-background px-3 py-1 rounded-bl-lg text-[9px] font-bold uppercase tracking-wider flex items-center shadow-sm">
                    <ShieldCheck className="w-3 h-3 mr-1" /> {t("defaultBadge")}
                  </div>
                )}

                <div className="flex justify-between items-start mb-4 pr-16">
                  <div className="flex items-center gap-2">
                    {addr.type === 'billing' ? <Building2 className="w-4 h-4 text-muted-foreground" /> : <Home className="w-4 h-4 text-muted-foreground" />}
                    <h3 className="font-semibold text-base">{addr.name}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-foreground text-sm font-medium bg-secondary/60 w-fit px-2.5 py-1 rounded-lg border border-border/50">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  {addr.phone}
                </div>

                <div className="text-muted-foreground text-sm space-y-1 mb-5">
                  {(() => {
                    let parsed;
                    try {
                      parsed = JSON.parse(addr.addressLine1);
                    } catch {
                      parsed = { block: addr.addressLine1, street: "", building: "", floorFlat: "" };
                    }
                    const lines = [
                      parsed.block && `Block ${parsed.block}`,
                      parsed.street && `Street ${parsed.street}`,
                      parsed.building && `Building ${parsed.building}`,
                      parsed.floorFlat && `Floor/Flat ${parsed.floorFlat}`
                    ].filter(Boolean).join(", ");
                    return <p className="text-foreground font-medium text-base">{lines}</p>;
                  })()}
                  <p>{addr.city}, {addr.state}</p>
                  <p>{addr.country}</p>
                  {addr.landmark && <p className="italic text-xs mt-3 opacity-80 before:content-['•'] ltr:before:mr-2 rtl:before:ml-2">Landmark: {addr.landmark}</p>}
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => onEdit(addr)} className="flex-1 h-10 rounded-xl bg-secondary/80 text-xs font-medium">
                    <Edit3 className="w-3.5 h-3.5 mr-2" /> {t("editBtn")}
                  </Button>
                  {!addr.default && (
                    <Button variant="outline" onClick={() => onSetDefault(addr.id, addr.type)} className="flex-1 h-10 rounded-xl border-border text-xs font-medium">
                      {t("setDefault")}
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => onDelete(addr.id)} className="w-10 h-10 p-0 rounded-xl border-border text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Fixed Bottom Button for Mobile (Hides when editing so form can breathe) */}
      {!isEditingAddress && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border z-10 md:hidden pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <Button onClick={onAdd} className="w-full h-14 rounded-xl shadow-lg font-medium text-sm uppercase tracking-widest text-background bg-foreground">
            <Plus className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
            {t("addNew")}
          </Button>
        </div>
      )}
    </div>
  )
}
