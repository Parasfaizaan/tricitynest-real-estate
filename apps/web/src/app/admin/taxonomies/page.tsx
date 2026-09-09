import { prisma } from "@/lib/prisma";
import { TaxonomyForm } from "@/components/admin/taxonomy-form";

export default async function TaxonomiesPage() {
  const [locations, propertyTypes, amenities] = await Promise.all([
    prisma.location.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div>
      <h1 className="display text-3xl text-navy">Taxonomies</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <Col title="Locations" items={locations.map((x) => x.name)} />
        <Col title="Types" items={propertyTypes.map((x) => x.name)} />
        <Col title="Amenities" items={amenities.map((x) => x.name)} />
      </div>
      <TaxonomyForm />
    </div>
  );
}

function Col({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card-surface p-5">
      <p className="font-semibold text-navy">{title}</p>
      <ul className="mt-3 space-y-1 text-sm text-ink-soft">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}
