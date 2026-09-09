import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/layout/site-shell";

export default async function ReraPage() {
  const [locations, types, properties] = await Promise.all([
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.property.findMany({
      where: { reraNumber: { not: null }, deletedAt: null, status: "PUBLISHED" },
      select: { title: true, reraNumber: true, city: true },
    }),
  ]);
  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <div className="container-px pt-28 pb-20">
        <h1 className="display text-4xl text-navy">RERA disclosures</h1>
        <ul className="mt-8 space-y-3">
          {properties.map((p) => (
            <li key={p.reraNumber} className="card-surface p-4">
              <p className="font-medium text-navy">{p.title}</p>
              <p className="text-sm text-ink-soft">
                {p.city} · {p.reraNumber}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </SiteShell>
  );
}
