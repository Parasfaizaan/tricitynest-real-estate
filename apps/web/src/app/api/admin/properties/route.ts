import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, unauthorized } from "@/lib/admin-guard";
import { jsonError, slugify } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";
import { Category, PropertyStatus, TransactionType, Furnishing, Possession } from "@prisma/client";
import { propertyInclude } from "@/lib/property-query";
import { MAX_PROPERTY_IMAGES, deleteS3Object, uploadPropertyImageToS3, type UploadedPropertyImage } from "@/lib/s3";
import { randomUUID } from "crypto";

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
  areaUnit: z.string().optional(),
  carpetArea: z.number().optional().nullable(),
  locality: z.string().min(2),
  locationId: z.string(),
  city: z.string().min(2),
  postalCode: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  furnishing: z.enum(["UNFURNISHED", "SEMI_FURNISHED", "FURNISHED"]).optional(),
  possession: z.enum(["READY", "UNDER_CONSTRUCTION", "NEW_LAUNCH"]).optional(),
  possessionDate: z.string().optional().nullable(),
  reraNumber: z.string().optional().nullable(),
  floor: z.number().optional().nullable(),
  totalFloors: z.number().optional().nullable(),
  facing: z.string().optional().nullable(),
  parking: z.boolean().optional(),
  tagline: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  amenityIds: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  builderId: z.string().optional().nullable(),
});

async function payloadFromRequest(req: Request) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return {
      data: await req.json().catch(() => null),
      files: [] as File[],
    };
  }

  const form = await req.formData();
  const raw = form.get("property");
  const data = typeof raw === "string" ? JSON.parse(raw) : null;
  const files = form.getAll("images").filter((file): file is File => file instanceof File);
  return { data, files };
}

async function validateRelations(data: z.infer<typeof schema>) {
  const [location, propertyType, builderCount, amenityCount] = await Promise.all([
    prisma.location.findUnique({ where: { id: data.locationId } }),
    prisma.propertyType.findUnique({ where: { id: data.propertyTypeId } }),
    data.builderId ? prisma.builder.count({ where: { id: data.builderId } }) : Promise.resolve(0),
    data.amenityIds?.length
      ? prisma.amenity.count({ where: { id: { in: data.amenityIds } } })
      : Promise.resolve(0),
  ]);
  if (!location) return "Location not found";
  if (!propertyType) return "Property type not found";
  if (data.builderId && builderCount !== 1) return "Builder not found";
  if (data.amenityIds?.length && amenityCount !== new Set(data.amenityIds).size) return "One or more amenities are invalid";
  return null;
}

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
  let body: Awaited<ReturnType<typeof payloadFromRequest>>;
  try {
    body = await payloadFromRequest(req);
  } catch {
    return jsonError("Invalid property payload");
  }

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid property");
  const relationError = await validateRelations(parsed.data);
  if (relationError) return jsonError(relationError);

  const legacyImages = parsed.data.images ?? [];
  if (legacyImages.length + body.files.length < 1) return jsonError("Upload at least one property image");
  if (legacyImages.length + body.files.length > MAX_PROPERTY_IMAGES) {
    return jsonError(`A property can have at most ${MAX_PROPERTY_IMAGES} images`);
  }

  const base = slugify(parsed.data.title);
  let slug = base;
  let i = 1;
  while (await prisma.property.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }

  const propertyId = randomUUID();
  const uploaded: UploadedPropertyImage[] = [];
  try {
    for (const [idx, file] of body.files.entries()) {
      uploaded.push(await uploadPropertyImageToS3(file, propertyId, legacyImages.length + idx, legacyImages.length === 0 && idx === 0));
    }
  } catch (error) {
    await Promise.allSettled(uploaded.map((image) => deleteS3Object(image.key)));
    return jsonError(error instanceof Error ? error.message : "Image upload failed");
  }

  let created;
  try {
    created = await prisma.$transaction(async (tx) =>
      tx.property.create({
        data: {
          id: propertyId,
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
          areaUnit: parsed.data.areaUnit || "sqft",
          carpetArea: parsed.data.carpetArea ?? null,
          address: `${parsed.data.locality}, ${parsed.data.city}`,
          locality: parsed.data.locality,
          locationId: parsed.data.locationId,
          city: parsed.data.city,
          postalCode: parsed.data.postalCode ?? null,
          latitude: parsed.data.latitude ?? null,
          longitude: parsed.data.longitude ?? null,
          furnishing: (parsed.data.furnishing as Furnishing) ?? Furnishing.UNFURNISHED,
          possession: (parsed.data.possession as Possession) ?? Possession.READY,
          possessionDate: parsed.data.possessionDate ?? null,
          reraNumber: parsed.data.reraNumber ?? null,
          floor: parsed.data.floor ?? null,
          totalFloors: parsed.data.totalFloors ?? null,
          facing: parsed.data.facing ?? null,
          parking: parsed.data.parking ?? false,
          tagline: parsed.data.tagline ?? null,
          builderId: parsed.data.builderId ?? null,
          createdById: user.id,
          updatedById: user.id,
          publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
          images: {
            create: [
              ...legacyImages.map((url, idx) => ({
                url,
                alt: parsed.data.title,
                sortOrder: idx,
                isCover: idx === 0,
              })),
              ...uploaded.map((image, idx) => ({
                url: image.url,
                publicId: image.key,
                alt: parsed.data.title,
                sortOrder: legacyImages.length + idx,
                isCover: legacyImages.length === 0 && idx === 0,
              })),
            ],
          },
          amenities: parsed.data.amenityIds?.length
            ? { create: [...new Set(parsed.data.amenityIds)].map((amenityId) => ({ amenityId })) }
            : undefined,
          features: parsed.data.features?.length
            ? { create: parsed.data.features.filter(Boolean).map((label) => ({ label })) }
            : undefined,
        },
      })
    );
  } catch (error) {
    await Promise.allSettled(uploaded.map((image) => deleteS3Object(image.key)));
    return jsonError(error instanceof Error ? error.message : "Property could not be created");
  }

  await writeAudit({
    actorId: user.id,
    action: "PROPERTY_CREATED",
    entityType: "Property",
    entityId: created.id,
    metadata: { slug: created.slug, propertyTitle: created.title, imageCount: legacyImages.length + uploaded.length },
  });

  return Response.json({ property: created });
}
