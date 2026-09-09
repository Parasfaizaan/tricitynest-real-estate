import { prisma } from "./prisma";
import { Category, Possession, PropertyStatus, TransactionType } from "@prisma/client";

export const propertyInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  location: true,
  propertyType: true,
  builder: true,
  amenities: { include: { amenity: true } },
  features: true,
  floorPlans: true,
};

export type PropertyFilters = {
  q?: string;
  category?: string;
  type?: string;
  location?: string;
  transaction?: string;
  bhk?: string;
  minPrice?: string;
  maxPrice?: string;
  minArea?: string;
  maxArea?: string;
  status?: string;
  furnishing?: string;
  possession?: string;
  featured?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
};

export async function queryProperties(filters: PropertyFilters) {
  const page = Math.max(1, Number(filters.page ?? 1) || 1);
  const pageSize = Math.min(24, Math.max(6, Number(filters.pageSize ?? 12) || 12));

  const where: Record<string, unknown> = {
    status: PropertyStatus.PUBLISHED,
    deletedAt: null,
  };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q } },
      { locality: { contains: filters.q } },
      { city: { contains: filters.q } },
    ];
  }
  if (filters.category === "residential") where.category = Category.RESIDENTIAL;
  if (filters.category === "commercial") where.category = Category.COMMERCIAL;
  if (filters.transaction === "buy") where.transactionType = TransactionType.BUY;
  if (filters.transaction === "rent") where.transactionType = TransactionType.RENT;
  if (filters.transaction === "invest") where.transactionType = TransactionType.INVEST;
  if (filters.location) {
    const loc = await prisma.location.findUnique({ where: { slug: filters.location } });
    if (loc) where.locationId = loc.id;
  }
  if (filters.type) {
    const t = await prisma.propertyType.findUnique({ where: { slug: filters.type } });
    if (t) where.propertyTypeId = t.id;
  }
  if (filters.bhk) {
    const beds = filters.bhk.split(",").map(Number).filter(Boolean);
    if (beds.includes(5)) {
      where.bedrooms = { gte: 5 };
    } else if (beds.length) {
      where.bedrooms = { in: beds };
    }
  }
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { gte: Number(filters.minPrice) } : {}),
      ...(filters.maxPrice ? { lte: Number(filters.maxPrice) } : {}),
    };
  }
  if (filters.minArea || filters.maxArea) {
    where.area = {
      ...(filters.minArea ? { gte: Number(filters.minArea) } : {}),
      ...(filters.maxArea ? { lte: Number(filters.maxArea) } : {}),
    };
  }
  if (filters.possession === "ready") where.possession = Possession.READY;
  if (filters.possession === "under-construction") where.possession = Possession.UNDER_CONSTRUCTION;
  if (filters.possession === "new-launch") where.possession = Possession.NEW_LAUNCH;
  if (filters.furnishing) where.furnishing = filters.furnishing.toUpperCase().replace("-", "_");
  if (filters.featured === "1") where.featured = true;

  const orderBy =
    filters.sort === "price-asc"
      ? { price: "asc" as const }
      : filters.sort === "price-desc"
        ? { price: "desc" as const }
        : filters.sort === "featured"
          ? { featured: "desc" as const }
          : { createdAt: "desc" as const };

  const [total, items] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      include: propertyInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

export function serializeProperty(p: {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  transactionType: string;
  status: string;
  featured: boolean;
  price: number;
  priceMax: number | null;
  negotiable: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  area: number;
  areaUnit: string;
  locality: string;
  city: string;
  state: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  furnishing: string;
  facing: string | null;
  possession: string;
  reraNumber: string | null;
  floor: number | null;
  totalFloors: number | null;
  parking: boolean;
  tagline: string | null;
  views: number;
  images: { url: string; alt?: string | null }[];
  amenities?: { amenity: { id: string; name: string; slug: string } }[];
  features?: { label: string }[];
  floorPlans?: { title: string; imageUrl: string }[];
  location: { name: string; slug: string };
  propertyType: { name: string; slug: string };
  builder?: { name: string } | null;
}) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    description: p.description,
    category: p.category,
    transactionType: p.transactionType,
    status: p.status,
    featured: p.featured,
    price: p.price,
    priceMax: p.priceMax,
    negotiable: p.negotiable,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    balconies: p.balconies,
    area: p.area,
    areaUnit: p.areaUnit,
    locality: p.locality,
    city: p.city,
    state: p.state,
    address: p.address,
    latitude: p.latitude,
    longitude: p.longitude,
    furnishing: p.furnishing,
    facing: p.facing,
    possession: p.possession,
    reraNumber: p.reraNumber,
    floor: p.floor,
    totalFloors: p.totalFloors,
    parking: p.parking,
    tagline: p.tagline,
    views: p.views,
    images: p.images,
    amenities: p.amenities?.map((a) => a.amenity) ?? [],
    features: p.features ?? [],
    floorPlans: p.floorPlans ?? [],
    location: p.location,
    propertyType: p.propertyType,
    builder: p.builder ?? null,
  };
}
