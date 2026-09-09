import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/layout/site-shell";
import { SellForm } from "@/components/forms/sell-form";

export default async function SellPage() {
  const [locations, types] = await Promise.all([
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <div className="container-px grid gap-10 pt-28 pb-20 md:grid-cols-2">
        <div>
          <p className="eyebrow">Sellers</p>
          <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.6rem)] text-navy">A quiet valuation</h1>
          <p className="mt-4 text-ink-soft">Share the basics. We’ll return a corridor-honest range — not a vanity number.</p>
        </div>
        <SellForm />
      </div>
    </SiteShell>
  );
}
