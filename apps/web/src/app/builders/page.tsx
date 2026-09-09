import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/layout/site-shell";
import { PropertyStatus } from "@prisma/client";

export default async function BuildersPage() {
  const [builders, locations, types] = await Promise.all([
    prisma.builder.findMany({
      include: {
        properties: {
          where: { status: PropertyStatus.PUBLISHED, deletedAt: null },
          select: { slug: true, title: true },
        },
      },
    }),
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <div className="container-px pt-28 pb-20">
        <p className="eyebrow">Developers</p>
        <h1 className="display mt-3 text-[clamp(2rem,4vw,3.4rem)] text-navy">Builders we work with</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {builders.map((b) => (
            <div key={b.id} className="card-surface p-6">
              <h2 className="text-xl font-semibold text-navy">{b.name}</h2>
              <p className="mt-2 text-sm text-ink-soft">{b.description}</p>
              <ul className="mt-4 space-y-1 text-sm">
                {b.properties.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/property/${p.slug}`} className="hover:underline">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
