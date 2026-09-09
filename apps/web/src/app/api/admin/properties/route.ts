import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, unauthorized } from "@/lib/admin-guard";
import { jsonError, slugify } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";
import { Category, PropertyStatus, TransactionType, Furnishing, Possession } from "@prisma/client";
import { propertyInclude } from "@/lib/property-query";

const schema = z.object({
  title: z.string().min(4),
  shortDescription: z.string().min(8),
  description: z.string().min(12),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  propertyTypeId: z.string(),
  transactionType: z.enum(["BUY", "RENT", "INVEST"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  price: z.number().positive(),
  priceMax: z.number().optional().nullable(),
  negotiable: z.boolean().optional(),
  bedrooms: z.number().optional().nullable(),
  bathrooms: z.number().optional().nullable(),
  balconies: z.number().optional().nullable(),
  area: z.number().positive(),
  locality: z.string().min(2),
  locationId: z.string(),
  city: z.string().min(2),
  furnishing: z.enum(["UNFURNISHED", "SEMI_FURNISHED", "FURNISHED"]).optional(),
  possession: z.enum(["READY", "UNDER_CONSTRUCTION", "NEW_LAUNCH"]).optional(),
  reraNumber: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  images: z.array(z.string().url()).min(1),
  amenityIds: z.array(z.string()).optional(),
  builderId: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const user = await requireStaff();
  if (!user) return unauthorized();
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const items = await prisma.property.findMany({
    where: {
      deletedAt: null,
      ...(q ? { OR: [{ title: { contains: q } }, { slug: { contains: q } }] } : {}),
    },
    include: {
      ...propertyInclude,
      deletionRequests: { where: { status: "PENDING" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return Response.json({ items });
}

export async function POST(req: Request) {
  const user = await requireStaff();
  if (!user) return unauthorized();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid property");

  const base = slugify(parsed.data.title);
  let slug = base;
  let i = 1;
  while (await prisma.property.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }

  const location = await prisma.location.findUnique({ where: { id: parsed.data.locationId } });
  if (!location) return jsonError("Location not found");

  const created = await prisma.property.create({
    data: {
      slug,
      title: parsed.data.title,
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description,
      category: parsed.data.category as Category,
      propertyTypeId: parsed.data.propertyTypeId,
      transactionType: parsed.data.transactionType as TransactionType,
      status: (parsed.data.status as PropertyStatus) ?? PropertyStatus.DRAFT,
      featured: parsed.data.featured ?? false,
      price: parsed.data.price,
      priceMax: parsed.data.priceMax ?? null,
      negotiable: parsed.data.negotiable ?? true,
      bedrooms: parsed.data.bedrooms ?? null,
      bathrooms: parsed.data.bathrooms ?? null,
      balconies: parsed.data.balconies ?? null,
      area: parsed.data.area,
      address: `${parsed.data.locality}, ${parsed.data.city}`,
      locality: parsed.data.locality,
      locationId: parsed.data.locationId,
      city: parsed.data.city,
      furnishing: (parsed.data.furnishing as Furnishing) ?? Furnishing.UNFURNISHED,
      possession: (parsed.data.possession as Possession) ?? Possession.READY,
      reraNumber: parsed.data.reraNumber ?? null,
      tagline: parsed.data.tagline ?? null,
      builderId: parsed.data.builderId ?? null,
      createdById: user.id,
      updatedById: user.id,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      images: {
        create: parsed.data.images.map((url, idx) => ({
          url,
          alt: parsed.data.title,
          sortOrder: idx,
          isCover: idx === 0,
        })),
      },
      amenities: parsed.data.amenityIds?.length
        ? { create: parsed.data.amenityIds.map((amenityId) => ({ amenityId })) }
        : undefined,
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "PROPERTY_CREATED",
    entityType: "Property",
    entityId: created.id,
    metadata: { slug: created.slug },
  });

  return Response.json({ property: created });
}
