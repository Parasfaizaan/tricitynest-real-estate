import { prisma } from "@/lib/prisma";
import { LeadActions } from "@/components/admin/lead-actions";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      preference: true,
      matches: { include: { property: { select: { title: true, slug: true } } } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
  return (
    <div>
      <h1 className="display text-3xl text-navy">Matcher leads</h1>
      <div className="mt-6 space-y-4">
        {leads.map((l) => (
          <div key={l.id} className="card-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy">{l.name}</p>
                <p className="text-sm text-ink-soft">
                  {l.phone} · {l.email}
                </p>
                <p className="mt-2 text-sm">
                  {l.preference?.transactionType} · {l.preference?.locationSlugs} · {l.preference?.propertyTypes}
                </p>
                <p className="text-xs text-ink-soft">
                  Budget {l.preference?.minBudget ?? "—"} – {l.preference?.maxBudget ?? "—"} · {l.preference?.timeline}
                </p>
              </div>
              <span className="rounded-full bg-ice/40 px-3 py-1 text-xs">{l.status}</span>
            </div>
            {l.matches.length > 0 && (
              <p className="mt-3 text-sm text-ink-soft">
                Matches: {l.matches.map((m) => m.property.title).join(" · ")}
              </p>
            )}
            <LeadActions id={l.id} status={l.status} notes={l.notes} />
          </div>
        ))}
      </div>
    </div>
  );
}
