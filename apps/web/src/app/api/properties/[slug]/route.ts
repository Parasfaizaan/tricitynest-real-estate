import { prisma } from "@/lib/prisma";
import { propertyInclude, serializeProperty } from "@/lib/property-query";
import { jsonError } from "@/lib/utils";
import { hasPriceAccess } from "@/lib/price-access";
import { PropertyStatus } from "@prisma/client";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const property = await prisma.property.findFirst({
    where: { slug, status: PropertyStatus.PUBLISHED, deletedAt: null },
    include: propertyInclude,
  });
  if (!property) return jsonError("Property not found", 404);

  await prisma.property.update({
    where: { id: property.id },
    data: { views: { increment: 1 } },
  });

  const similar = await prisma.property.findMany({
    where: {
      id: { not: property.id },
      status: PropertyStatus.PUBLISHED,
      deletedAt: null,
      OR: [{ locationId: property.locationId }, { propertyTypeId: property.propertyTypeId }],
    },
    include: propertyInclude,
    take: 3,
    orderBy: { featured: "desc" },
  });

  const canViewPrice = await hasPriceAccess();
  return Response.json({
    property: serializeProperty(property, canViewPrice),
    similar: similar.map((item) => serializeProperty(item, canViewPrice)),
  }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
