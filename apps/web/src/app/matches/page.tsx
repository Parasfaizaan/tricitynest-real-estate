import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/layout/site-shell";
import { MatchesClient } from "@/components/matcher/matches-client";
import { hasPriceAccess } from "@/lib/price-access";
import { propertyInclude, serializeProperty } from "@/lib/property-query";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const { lead } = await searchParams;
  const [locations, types, canViewPrice] = await Promise.all([
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    hasPriceAccess(),
  ]);

  let serverMatches: unknown[] = [];
  if (lead) {
    const rows = await prisma.propertyMatch.findMany({
      where: { leadId: lead },
      include: {
        property: {
          include: propertyInclude,
        },
      },
      orderBy: { score: "desc" },
    });
    serverMatches = rows.map((r) => ({ ...serializeProperty(r.property, canViewPrice), score: r.score }));
  }

  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <MatchesClient serverMatches={serverMatches} />
    </SiteShell>
  );
}
