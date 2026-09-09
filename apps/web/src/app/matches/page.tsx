import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/layout/site-shell";
import { MatchesClient } from "@/components/matcher/matches-client";

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const { lead } = await searchParams;
  const [locations, types] = await Promise.all([
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  let serverMatches: unknown[] = [];
  if (lead) {
    const rows = await prisma.propertyMatch.findMany({
      where: { leadId: lead },
      include: {
        property: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            location: true,
            propertyType: true,
          },
        },
      },
      orderBy: { score: "desc" },
    });
    serverMatches = rows.map((r) => ({ ...r.property, score: r.score }));
  }

  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <MatchesClient serverMatches={serverMatches} />
    </SiteShell>
  );
}
