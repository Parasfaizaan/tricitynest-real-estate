import { prisma } from "@/lib/prisma";

export async function GET() {
  const [locations, propertyTypes, amenities] = await Promise.all([
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.amenity.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  return Response.json({ locations, propertyTypes, amenities });
}
