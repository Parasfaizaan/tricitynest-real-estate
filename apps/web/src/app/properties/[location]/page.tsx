import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { queryProperties, serializeProperty } from "@/lib/property-query";
import { hasPriceAccess } from "@/lib/price-access";
import { SiteShell } from "@/components/layout/site-shell";
import { PropertiesBrowser } from "@/components/properties/browser";

export default async function LocationPropertiesPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location } = await params;
  const loc = await prisma.location.findUnique({ where: { slug: location } });
  if (!loc) notFound();
  const [result, locations, types, canViewPrice] = await Promise.all([
    queryProperties({ location }),
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    hasPriceAccess(),
  ]);
  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <PropertiesBrowser
        initial={result.items.map((item) => serializeProperty(item, canViewPrice))}
        total={result.total}
        page={result.page}
        pages={result.pages}
        locations={locations}
        types={types}
        filters={{ location }}
      />
    </SiteShell>
  );
}
