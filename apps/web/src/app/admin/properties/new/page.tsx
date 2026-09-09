import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/admin/property-form";

export default async function NewPropertyPage() {
  const [locations, propertyTypes, amenities, builders] = await Promise.all([
    prisma.location.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
    prisma.builder.findMany(),
  ]);
  return (
    <div>
      <h1 className="display mb-6 text-3xl text-navy">New property</h1>
      <PropertyForm tax={{ locations, propertyTypes, amenities, builders }} />
    </div>
  );
}
