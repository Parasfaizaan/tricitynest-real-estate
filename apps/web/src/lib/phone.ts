const phoneRegex = /^(?:\+91[\s-]?|91[\s-]?|0)?([6-9]\d{9})$/;

export function normalizeIndianPhone(value: string) {
  const match = value.trim().replace(/[\s-]/g, "").match(phoneRegex);
  if (!match) return null;
  return `+91${match[1]}`;
}

export function phoneLocalPart(phone: string) {
  return phone.replace(/^\+91/, "");
}

export function phoneOnlyEmail(phone: string) {
  return `${phone.replace(/\D/g, "")}@phone.tricitynest.local`;
}

export function isPhoneOnlyEmail(email?: string | null) {
  return Boolean(email?.endsWith("@phone.tricitynest.local"));
}
