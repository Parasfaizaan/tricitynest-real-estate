import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/layout/site-shell";
import { LocationsGrid } from "@/components/home/landing-sections";

export default async function LocationsPage() {
  const [locations, types] = await Promise.all([
    prisma.location.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { properties: true } } },
    }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <div className="pt-16">
        <LocationsGrid locations={locations} />
      </div>
    </SiteShell>
  );
}
