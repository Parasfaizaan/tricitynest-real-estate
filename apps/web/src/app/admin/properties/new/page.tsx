import { Category } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/admin/property-form";

export default async function NewPropertyPage() {
  await prisma.$transaction([
    prisma.propertyType.upsert({
      where: { slug: "independent-floor" },
      update: { name: "Independent Floor", category: Category.RESIDENTIAL, active: true, sortOrder: 3 },
      create: { name: "Independent Floor", slug: "independent-floor", category: Category.RESIDENTIAL, sortOrder: 3 },
    }),
    prisma.propertyType.updateMany({ where: { slug: "villa" }, data: { sortOrder: 4 } }),
    prisma.propertyType.updateMany({ where: { slug: "plot" }, data: { sortOrder: 5 } }),
  ]);

  const [locations, propertyTypes, amenities, builders] = await Promise.all([
    prisma.location.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
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
