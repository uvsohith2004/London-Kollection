export function AddressDetails({ address }: { address: any }) {
  let parsed;
  try {
    parsed = JSON.parse(address.addressLine1);
  } catch {
    parsed = { block: address.addressLine1, street: "", building: "", floorFlat: "" };
  }
  
  const lines = [
    parsed.block && `Block ${parsed.block}`,
    parsed.street && `Street ${parsed.street}`,
    parsed.building && `Building ${parsed.building}`,
    parsed.floorFlat && `Floor/Flat ${parsed.floorFlat}`
  ].filter(Boolean).join(", ");

  return (
    <div className="text-muted-foreground text-sm space-y-1.5 flex-1 leading-relaxed mb-5 lg:mb-0">
      <p className="text-foreground font-medium text-base">{lines}</p>
      <p>{address.city}, {address.state}</p>
      <p>{address.country}</p>
      {address.landmark && (
        <p className="italic text-xs mt-3 opacity-80 before:content-['•'] ltr:before:mr-2 rtl:before:ml-2">
          Landmark: {address.landmark}
        </p>
      )}
    </div>
  )
}
