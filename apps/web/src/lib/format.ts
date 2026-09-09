export function formatInr(amount: number, transactionType?: string) {
  if (transactionType === "RENT") {
    return `₹${amount.toLocaleString("en-IN")}/mo`;
  }
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatArea(area: number, unit = "sqft") {
  return `${area.toLocaleString("en-IN")} ${unit}`;
}

export function bhkLabel(bedrooms?: number | null) {
  if (!bedrooms) return null;
  return bedrooms >= 5 ? "5+ BHK" : `${bedrooms} BHK`;
}

export function possessionLabel(value: string) {
  const map: Record<string, string> = {
    READY: "Ready to move",
    UNDER_CONSTRUCTION: "Under construction",
    NEW_LAUNCH: "New launch",
  };
  return map[value] ?? value;
}

export function furnishingLabel(value: string) {
  const map: Record<string, string> = {
    UNFURNISHED: "Unfurnished",
    SEMI_FURNISHED: "Semi furnished",
    FURNISHED: "Furnished",
  };
  return map[value] ?? value;
}
