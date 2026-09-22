import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, unauthorized } from "@/lib/admin-guard";
import { jsonError } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";
import { Category, Furnishing, Possession, PropertyStatus, TransactionType } from "@prisma/client";
import { propertyInclude } from "@/lib/property-query";
import { MAX_PROPERTY_IMAGES, MIN_PROPERTY_IMAGES, deleteS3Object, uploadPropertyImageToS3, type UploadedPropertyImage } from "@/lib/s3";

const schema = z.object({
  title: z.string().min(4).optional(),
  shortDescription: z.string().min(8).optional().nullable(),
  description: z.string().min(3).optional(),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL"]).optional(),
  propertyTypeId: z.string().optional(),
  transactionType: z.enum(["BUY", "RENT", "INVEST"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  price: z.number().positive().optional(),
  priceMax: z.number().optional().nullable(),
  negotiable: z.boolean().optional(),
  listingType: z.string().optional().nullable(),
  sellerName: z.string().optional().nullable(),
  sellerPhone: z.string().optional().nullable(),
  sellerPropertyAddress: z.string().optional().nullable(),
  bhk: z.number().optional().nullable(),
  bedrooms: z.number().optional().nullable(),
  bathrooms: z.number().optional().nullable(),
  balconies: z.number().optional().nullable(),
  area: z.number().positive().optional(),
  areaUnit: z.string().optional(),
  superArea: z.number().optional().nullable(),
  builtUpArea: z.number().optional().nullable(),
  carpetArea: z.number().optional().nullable(),
  otherRooms: z.string().optional().nullable(),
  furnishingItems: z.string().optional().nullable(),
  locality: z.string().min(2, "Please select a sector or sub-location").optional(),
  sector: z.string().optional().nullable(),
  projectName: z.string().optional().nullable(),
  locationId: z.string().min(1, "Please select a sector or sub-location").optional(),
  city: z.string().min(2, "Please select a city").optional(),
  postalCode: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  furnishing: z.enum(["UNFURNISHED", "SEMI_FURNISHED", "FURNISHED"]).optional(),
  possession: z.enum(["READY", "UNDER_CONSTRUCTION", "NEW_LAUNCH"]).optional(),
  possessionDate: z.string().optional().nullable(),
  propertyAge: z.string().optional().nullable(),
  reraNumber: z.string().optional().nullable(),
  floor: z.number().optional().nullable(),
  floorLabel: z.string().optional().nullable(),
  totalFloors: z.number().optional().nullable(),
  facing: z.string().optional().nullable(),
  parking: z.boolean().optional(),
  coveredParking: z.number().optional().nullable(),
  openParking: z.number().optional().nullable(),
  plotLength: z.number().optional().nullable(),
  plotBreadth: z.number().optional().nullable(),
  floorsAllowed: z.number().optional().nullable(),
  boundaryWall: z.boolean().optional().nullable(),
  openSides: z.number().optional().nullable(),
  constructionDone: z.boolean().optional().nullable(),
  commercialSubtype: z.string().optional().nullable(),
  locatedInside: z.string().optional().nullable(),
  washroomType: z.string().optional().nullable(),
  parkingType: z.string().optional().nullable(),
  entranceWidth: z.number().optional().nullable(),
  ceilingHeight: z.number().optional().nullable(),
  tagline: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  existingImages: z.array(z.object({ id: z.string(), sortOrder: z.number(), isCover: z.boolean() })).optional(),
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

async function relationError(data: z.infer<typeof schema>) {
  const [locationCount, propertyTypeCount, builderCount, amenityCount] = await Promise.all([
    data.locationId ? prisma.location.count({ where: { id: data.locationId } }) : Promise.resolve(1),
    data.propertyTypeId ? prisma.propertyType.count({ where: { id: data.propertyTypeId } }) : Promise.resolve(1),
    data.builderId ? prisma.builder.count({ where: { id: data.builderId } }) : Promise.resolve(1),
    data.amenityIds?.length
      ? prisma.amenity.count({ where: { id: { in: data.amenityIds } } })
      : Promise.resolve(0),
  ]);
  if (locationCount !== 1) return "Location not found";
  if (propertyTypeCount !== 1) return "Property type not found";
  if (data.builderId && builderCount !== 1) return "Builder not found";
  if (data.amenityIds?.length && amenityCount !== new Set(data.amenityIds).size) return "One or more amenities are invalid";
  return null;
}

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
  const existing = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: { images: true, amenities: true, features: true },
  });
  if (!existing) return jsonError("Not found", 404);

  let body: Awaited<ReturnType<typeof payloadFromRequest>>;
  try {
    body = await payloadFromRequest(req);
  } catch {
    return jsonError("Invalid property payload");
  }

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid data");
  const relError = await relationError(parsed.data);
  if (relError) return jsonError(relError);

  const data = parsed.data;
  const usingImageManager = Boolean(data.existingImages) || body.files.length > 0;
  const keepImageIds = new Set(data.existingImages?.map((image) => image.id) ?? []);
  const uploaded: UploadedPropertyImage[] = [];
  const removedImages = usingImageManager ? existing.images.filter((image) => !keepImageIds.has(image.id)) : [];
  const finalImageCount = usingImageManager ? keepImageIds.size + body.files.length : data.images?.length;

  if (finalImageCount != null) {
    if (finalImageCount < MIN_PROPERTY_IMAGES) return jsonError(`A property must have at least ${MIN_PROPERTY_IMAGES} images`);
    if (finalImageCount > MAX_PROPERTY_IMAGES) return jsonError(`A property can have at most ${MAX_PROPERTY_IMAGES} images`);
  }

  if (usingImageManager) {
    const trustedIds = new Set(existing.images.map((image) => image.id));
    if ([...keepImageIds].some((imageId) => !trustedIds.has(imageId))) return jsonError("Invalid image selection");
    try {
      for (const [idx, file] of body.files.entries()) {
        uploaded.push(await uploadPropertyImageToS3(file, id, keepImageIds.size + idx, keepImageIds.size === 0 && idx === 0));
      }
    } catch (error) {
      await Promise.allSettled(uploaded.map((image) => deleteS3Object(image.key)));
      return jsonError(error instanceof Error ? error.message : "Image upload failed");
    }
  }

  let updated;
  try {
    updated = await prisma.$transaction(async (tx) => {
    if (!usingImageManager && data.images) {
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
    if (usingImageManager) {
      await tx.propertyImage.deleteMany({ where: { propertyId: id, id: { notIn: [...keepImageIds] } } });
      for (const image of data.existingImages ?? []) {
        await tx.propertyImage.update({
          where: { id: image.id },
          data: { sortOrder: image.sortOrder, isCover: image.isCover },
        });
      }
      if (uploaded.length) {
        await tx.propertyImage.createMany({
          data: uploaded.map((image, idx) => ({
            propertyId: id,
            url: image.url,
            publicId: image.key,
            alt: data.title ?? existing.title,
            sortOrder: keepImageIds.size + idx,
            isCover: keepImageIds.size === 0 && idx === 0,
          })),
        });
      }
    }
    if (data.amenityIds) {
      await tx.propertyAmenity.deleteMany({ where: { propertyId: id } });
      if (data.amenityIds.length) {
        await tx.propertyAmenity.createMany({
          data: [...new Set(data.amenityIds)].map((amenityId) => ({ propertyId: id, amenityId })),
        });
      }
    }
    if (data.features) {
      await tx.propertyFeature.deleteMany({ where: { propertyId: id } });
      const labels = data.features.map((label) => label.trim()).filter(Boolean);
      if (labels.length) {
        await tx.propertyFeature.createMany({ data: labels.map((label) => ({ propertyId: id, label })) });
      }
    }
    const row = await tx.property.update({
      where: { id },
      data: {
        title: data.title,
        shortDescription: data.shortDescription ?? (data.description ? data.description.slice(0, 160) : undefined),
        description: data.description,
        category: data.category as Category | undefined,
        propertyTypeId: data.propertyTypeId,
        transactionType: data.transactionType as TransactionType | undefined,
        status: data.status as PropertyStatus | undefined,
        featured: data.featured,
        price: data.price,
        priceMax: data.priceMax,
        negotiable: data.negotiable,
        listingType: data.listingType,
        sellerName: data.sellerName,
        sellerPhone: data.sellerPhone,
        bhk: data.bhk,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        balconies: data.balconies,
        area: data.area,
        areaUnit: data.areaUnit,
        superArea: data.superArea,
        builtUpArea: data.builtUpArea,
        carpetArea: data.carpetArea,
        otherRooms: data.otherRooms,
        furnishingItems: data.furnishingItems,
        locality: data.locality,
        sector: data.sector,
        projectName: data.projectName,
        locationId: data.locationId,
        city: data.city,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        address:
          data.listingType === "RESALE" && data.sellerPropertyAddress
            ? data.sellerPropertyAddress
            : data.locality && data.city
              ? [data.projectName, data.sector || data.locality, data.city].filter(Boolean).join(", ")
              : undefined,
        furnishing: data.furnishing as Furnishing | undefined,
        possession: data.possession as Possession | undefined,
        possessionDate: data.possessionDate,
        propertyAge: data.propertyAge,
        reraNumber: data.reraNumber,
        floor: data.floor,
        floorLabel: data.floorLabel,
        totalFloors: data.totalFloors,
        facing: data.facing,
        parking: data.parking,
        coveredParking: data.coveredParking,
        openParking: data.openParking,
        plotLength: data.plotLength,
        plotBreadth: data.plotBreadth,
        floorsAllowed: data.floorsAllowed,
        boundaryWall: data.boundaryWall,
        openSides: data.openSides,
        constructionDone: data.constructionDone,
        commercialSubtype: data.commercialSubtype,
        locatedInside: data.locatedInside,
        washroomType: data.washroomType,
        parkingType: data.parkingType,
        entranceWidth: data.entranceWidth,
        ceilingHeight: data.ceilingHeight,
        tagline: data.tagline,
        builderId: data.builderId,
        updatedById: user.id,
        publishedAt:
          data.status === "PUBLISHED" && existing.status !== "PUBLISHED" ? new Date() : existing.publishedAt,
      },
      select: {
        id: true,
        title: true,
      },
    });
    if (data.sellerPropertyAddress !== undefined) {
      await tx.$executeRaw`UPDATE "Property" SET "sellerPropertyAddress" = ${data.sellerPropertyAddress} WHERE "id" = ${id}`;
    }
    return row;
  });
  } catch (error) {
    await Promise.allSettled(uploaded.map((image) => deleteS3Object(image.key)));
    return jsonError(error instanceof Error ? error.message : "Property update failed");
  }

  if (removedImages.length) {
    await Promise.allSettled(removedImages.map((image) => deleteS3Object(image.publicId)));
  }

  const action =
    data.status === "PUBLISHED" && existing.status !== "PUBLISHED"
      ? "PROPERTY_PUBLISHED"
      : data.status === "DRAFT" && existing.status === "PUBLISHED"
        ? "PROPERTY_UNPUBLISHED"
        : "PROPERTY_UPDATED";

  const changedFields = Object.entries(data)
    .filter(([key, value]) => value !== undefined && !["images", "existingImages", "amenityIds", "features"].includes(key))
    .map(([key]) => key);
  await writeAudit({
    actorId: user.id,
    action,
    entityType: "Property",
    entityId: id,
    metadata: {
      propertyTitle: updated.title,
      changedFields,
      imagesAdded: uploaded.length,
      imagesRemoved: removedImages.length,
      amenitiesUpdated: data.amenityIds != null,
      featuresUpdated: data.features != null,
    },
  });
  return Response.json({ property: updated });
}
