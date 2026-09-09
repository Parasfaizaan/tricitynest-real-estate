import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/layout/site-shell";

export default async function TermsPage() {
  const [locations, types] = await Promise.all([
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <article className="container-px max-w-3xl pt-28 pb-20">
        <h1 className="display text-4xl text-navy">Terms of use</h1>
        <p className="mt-6 text-ink-soft leading-relaxed">
          Listings on TricityNest are indicative. Prices, availability and area may change. Site visits are by appointment. TricityNest is an advisory and is not a party to the sale unless separately contracted.
        </p>
      </article>
    </SiteShell>
  );
}
