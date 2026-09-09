import { queryProperties, serializeProperty } from "@/lib/property-query";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/layout/site-shell";
import { PropertiesBrowser } from "@/components/properties/browser";

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function PropertiesPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const filters = {
    q: get("q"),
    category: get("category"),
    type: get("type"),
    location: get("location"),
    transaction: get("transaction"),
    bhk: get("bhk"),
    minPrice: get("minPrice"),
    maxPrice: get("maxPrice"),
    minArea: get("minArea"),
    maxArea: get("maxArea"),
    possession: get("possession"),
    furnishing: get("furnishing"),
    sort: get("sort"),
    page: get("page"),
  };
  const [result, locations, types] = await Promise.all([
    queryProperties(filters),
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <PropertiesBrowser
        initial={result.items.map(serializeProperty)}
        total={result.total}
        page={result.page}
        pages={result.pages}
        locations={locations}
        types={types}
        filters={filters}
      />
    </SiteShell>
  );
}
