import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, unauthorized } from "@/lib/admin-guard";
import { jsonError } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";
import { Category, Furnishing, Possession, PropertyStatus, TransactionType } from "@prisma/client";
import { propertyInclude } from "@/lib/property-query";

const schema = z.object({
  title: z.string().min(4).optional(),
  shortDescription: z.string().min(8).optional(),
  description: z.string().min(12).optional(),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL"]).optional(),
  propertyTypeId: z.string().optional(),
  transactionType: z.enum(["BUY", "RENT", "INVEST"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  price: z.number().positive().optional(),
  priceMax: z.number().optional().nullable(),
  negotiable: z.boolean().optional(),
  bedrooms: z.number().optional().nullable(),
  bathrooms: z.number().optional().nullable(),
  balconies: z.number().optional().nullable(),
  area: z.number().positive().optional(),
  locality: z.string().optional(),
  locationId: z.string().optional(),
  city: z.string().optional(),
  furnishing: z.enum(["UNFURNISHED", "SEMI_FURNISHED", "FURNISHED"]).optional(),
  possession: z.enum(["READY", "UNDER_CONSTRUCTION", "NEW_LAUNCH"]).optional(),
  reraNumber: z.string().optional().nullable(),
  tagline: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  amenityIds: z.array(z.string()).optional(),
  builderId: z.string().optional().nullable(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const property = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: { ...propertyInclude, deletionRequests: true },
  });
  if (!property) return jsonError("Not found", 404);
  return Response.json({ property });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const existing = await prisma.property.findFirst({ where: { id, deletedAt: null } });
  if (!existing) return jsonError("Not found", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid data");

  const data = parsed.data;
  const updated = await prisma.$transaction(async (tx) => {
    if (data.images) {
      await tx.propertyImage.deleteMany({ where: { propertyId: id } });
      await tx.propertyImage.createMany({
        data: data.images.map((url, idx) => ({
          propertyId: id,
          url,
          alt: data.title ?? existing.title,
          sortOrder: idx,
          isCover: idx === 0,
        })),
      });
    }
    if (data.amenityIds) {
      await tx.propertyAmenity.deleteMany({ where: { propertyId: id } });
      if (data.amenityIds.length) {
        await tx.propertyAmenity.createMany({
          data: data.amenityIds.map((amenityId) => ({ propertyId: id, amenityId })),
        });
      }
    }
    return tx.property.update({
      where: { id },
      data: {
        title: data.title,
        shortDescription: data.shortDescription,
        description: data.description,
        category: data.category as Category | undefined,
        propertyTypeId: data.propertyTypeId,
        transactionType: data.transactionType as TransactionType | undefined,
        status: data.status as PropertyStatus | undefined,
        featured: data.featured,
        price: data.price,
        priceMax: data.priceMax,
        negotiable: data.negotiable,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        balconies: data.balconies,
        area: data.area,
        locality: data.locality,
        locationId: data.locationId,
        city: data.city,
        address: data.locality && data.city ? `${data.locality}, ${data.city}` : undefined,
        furnishing: data.furnishing as Furnishing | undefined,
        possession: data.possession as Possession | undefined,
        reraNumber: data.reraNumber,
        tagline: data.tagline,
        builderId: data.builderId,
        updatedById: user.id,
        publishedAt:
          data.status === "PUBLISHED" && existing.status !== "PUBLISHED" ? new Date() : existing.publishedAt,
      },
    });
  });

  const action =
    data.status === "PUBLISHED" && existing.status !== "PUBLISHED"
      ? "PROPERTY_PUBLISHED"
      : data.status === "DRAFT" && existing.status === "PUBLISHED"
        ? "PROPERTY_UNPUBLISHED"
        : "PROPERTY_UPDATED";

  await writeAudit({ actorId: user.id, action, entityType: "Property", entityId: id });
  return Response.json({ property: updated });
}
