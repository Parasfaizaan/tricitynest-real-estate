import { prisma } from "@/lib/prisma";
import { propertyInclude, serializeProperty } from "@/lib/property-query";
import { hasPriceAccess } from "@/lib/price-access";
import { PropertyStatus } from "@prisma/client";
import { SiteShell } from "@/components/layout/site-shell";
import { HomeExperience } from "@/components/home/home-experience";

export default async function HomePage() {
  const [featured, locations, taxonomies, count, canViewPrice] = await Promise.all([
    prisma.property.findMany({
      where: { status: PropertyStatus.PUBLISHED, deletedAt: null, featured: true },
      include: propertyInclude,
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.location.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { properties: true } } },
    }),
    Promise.all([
      prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
      prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    ]),
    prisma.property.count({ where: { status: PropertyStatus.PUBLISHED, deletedAt: null } }),
    hasPriceAccess(),
  ]);

  const [locs, types] = taxonomies;
  const slides = featured.length ? featured : await prisma.property.findMany({
    where: { status: PropertyStatus.PUBLISHED, deletedAt: null },
    include: propertyInclude,
    take: 5,
  });

  return (
    <SiteShell
      autoOpenMatcher
      taxonomies={{ locations: locs, propertyTypes: types }}
    >
      <HomeExperience
        slides={slides.map((item) => serializeProperty(item, canViewPrice))}
        featured={featured.map((item) => serializeProperty(item, canViewPrice))}
        locations={locations}
        count={count}
      />
    </SiteShell>
  );
}
