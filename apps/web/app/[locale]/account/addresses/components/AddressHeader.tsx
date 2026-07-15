import { getTranslations } from "next-intl/server"
import { AddAddressButton } from "./AddAddressButton"

export async function AddressHeader({ hideAddButton }: { hideAddButton?: boolean }) {
  const t = await getTranslations("Addresses")
  
  return (
    <div className="mb-6 md:mb-8 pt-2 md:pt-0 flex items-center justify-between border-b-0 md:border-b border-border/40 pb-0 md:pb-6">
      <div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif tracking-tight mb-1 md:mb-2 text-foreground">{t("title")}</h1>
        <p className="text-muted-foreground font-light text-sm">{t("description")}</p>
      </div>
      {!hideAddButton && <AddAddressButton />}
    </div>
  )
}
