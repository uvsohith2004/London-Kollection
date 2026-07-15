import { DesktopAddressCard } from "./DesktopAddressCard"
import { TabletAddressCard } from "./TabletAddressCard"
import { MobileAddressCard } from "./MobileAddressCard"

export function AddressCard({ address }: { address: any }) {
  return (
    <>
      <div className="hidden lg:block h-full">
        <DesktopAddressCard address={address} />
      </div>
      <div className="hidden md:block lg:hidden h-full">
        <TabletAddressCard address={address} />
      </div>
      <div className="block md:hidden h-full">
        <MobileAddressCard address={address} />
      </div>
    </>
  )
}
