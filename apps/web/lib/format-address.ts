export function formatAddressLine(addressLine1: string | undefined | null): string {
  if (!addressLine1) return "—";
  
  try {
    const parsed = JSON.parse(addressLine1);
    if (typeof parsed === 'object' && parsed !== null) {
      const parts = [];
      if (parsed.block) parts.push(parsed.block);
      if (parsed.street) parts.push(parsed.street);
      if (parsed.building) parts.push(parsed.building);
      if (parsed.floorFlat) parts.push(parsed.floorFlat);
      
      if (parts.length > 0) {
        return parts.join(", ");
      }
    }
    return addressLine1;
  } catch (e) {
    // If it's not valid JSON, just return the raw string
    return addressLine1;
  }
}
