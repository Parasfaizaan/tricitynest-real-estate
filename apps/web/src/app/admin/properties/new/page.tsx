import { prisma } from "@/lib/prisma";
import { ensureDefaultAmenities } from "@/lib/admin-default-amenities";
import { ensureDefaultPropertyTypes } from "@/lib/admin-default-property-types";
import { PropertyForm } from "@/components/admin/property-form";

export default async function NewPropertyPage() {
  await ensureDefaultPropertyTypes(prisma);
  await ensureDefaultAmenities(prisma);

  const [locations, propertyTypes, amenities, builders, projects] = await Promise.all([
    prisma.location.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
    prisma.builder.findMany(),
    prisma.property.findMany({
      where: { projectName: { not: null } },
      select: { projectName: true },
      distinct: ["projectName"],
      orderBy: { projectName: "asc" },
    }),
  ]);
  return (
    <div>
      <h1 className="display mb-6 text-3xl text-navy">New property</h1>
      <PropertyForm tax={{ locations, propertyTypes, amenities, builders }} projectNames={projects.flatMap((project) => (project.projectName ? [project.projectName] : []))} />
    </div>
  );
}
