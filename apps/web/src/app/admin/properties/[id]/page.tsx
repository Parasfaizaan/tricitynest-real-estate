import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/admin/property-form";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [property, locations, propertyTypes, amenities, builders] = await Promise.all([
    prisma.property.findFirst({
      where: { id, deletedAt: null },
      include: { images: true, amenities: true, deletionRequests: { where: { status: "PENDING" } } },
    }),
    prisma.location.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
    prisma.builder.findMany(),
  ]);
  if (!property) notFound();
  return (
    <div>
      <h1 className="display mb-6 text-3xl text-navy">Edit property</h1>
      <PropertyForm
        tax={{ locations, propertyTypes, amenities, builders }}
        initial={{ ...property, deletionPending: property.deletionRequests.length > 0 }}
      />
    </div>
  );
}
