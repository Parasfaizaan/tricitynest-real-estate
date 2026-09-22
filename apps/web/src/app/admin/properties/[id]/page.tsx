import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAmenities } from "@/lib/admin-default-amenities";
import { ensureDefaultPropertyTypes } from "@/lib/admin-default-property-types";
import { PropertyForm } from "@/components/admin/property-form";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ensureDefaultPropertyTypes(prisma);
  await ensureDefaultAmenities(prisma);
  const [property, locations, propertyTypes, amenities, builders, projects] = await Promise.all([
    prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        amenities: true,
        features: true,
        deletionRequests: { where: { status: "PENDING" } },
      },
    }),
    prisma.location.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
    prisma.builder.findMany(),
    prisma.property.findMany({
      where: { projectName: { not: null } },
      select: { projectName: true },
      distinct: ["projectName"],
      orderBy: { projectName: "asc" },
    }),
  ]);
  if (!property) notFound();
  return (
    <div>
      <h1 className="display mb-6 text-3xl text-navy">Edit property</h1>
      <PropertyForm
        tax={{ locations, propertyTypes, amenities, builders }}
        initial={{ ...property, deletionPending: property.deletionRequests.length > 0 }}
        projectNames={projects.flatMap((project) => (project.projectName ? [project.projectName] : []))}
      />
    </div>
  );
}
