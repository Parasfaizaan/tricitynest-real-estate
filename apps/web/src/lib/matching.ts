import { prisma } from "./prisma";
import { PropertyStatus, TransactionType } from "@prisma/client";

export type MatcherPayload = {
  propertyTypes: string[];
  transactionType: "BUY" | "RENT" | "INVEST";
  locationSlugs: string[];
  minBudget?: number | null;
  maxBudget?: number | null;
  bedrooms?: number[];
  minArea?: number | null;
  maxArea?: number | null;
  timeline?: string | null;
};

export async function matchProperties(pref: MatcherPayload, take = 12) {
  const types = pref.propertyTypes.length
    ? await prisma.propertyType.findMany({ where: { slug: { in: pref.propertyTypes } } })
    : [];

  const locations = pref.locationSlugs.length
    ? await prisma.location.findMany({ where: { slug: { in: pref.locationSlugs } } })
    : [];

  const where = {
    status: PropertyStatus.PUBLISHED,
    deletedAt: null,
    ...(types.length ? { propertyTypeId: { in: types.map((t) => t.id) } } : {}),
    ...(locations.length ? { locationId: { in: locations.map((l) => l.id) } } : {}),
    ...(pref.transactionType ? { transactionType: pref.transactionType as TransactionType } : {}),
    ...(pref.maxBudget ? { price: { lte: pref.maxBudget } } : {}),
    ...(pref.minBudget ? { price: { gte: pref.minBudget } } : {}),
    ...(pref.bedrooms?.length ? { bedrooms: { in: pref.bedrooms } } : {}),
    ...(pref.minArea ? { area: { gte: pref.minArea } } : {}),
    ...(pref.maxArea ? { area: { lte: pref.maxArea } } : {}),
  };

  const results = await prisma.property.findMany({
    where,
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      location: true,
      propertyType: true,
      builder: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take,
  });

  return results.map((p) => {
    let score = 40;
    if (types.some((t) => t.id === p.propertyTypeId)) score += 20;
    if (locations.some((l) => l.id === p.locationId)) score += 20;
    if (p.featured) score += 10;
    if (pref.maxBudget && p.price <= pref.maxBudget) score += 10;
    return { ...p, score: Math.min(score, 100) };
  });
}
