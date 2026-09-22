import { prisma } from "@/lib/prisma";

export default async function InboxPage() {
  const [enquiries, contacts, sellLeads, newsletters] = await Promise.all([
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, include: { property: true } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.sellLead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.newsletter.findMany({ orderBy: { createdAt: "desc" } }),
    
  ]);
  return (
    <div className="space-y-10">
      <section>
        <h1 className="display text-3xl text-navy">Inbox</h1>
        <h2 className="mt-6 font-semibold">Property enquiries</h2>
        <List
          rows={enquiries.map((e) => ({
            id: e.id,
            t: `${e.name} · ${e.phone}`,
            d: `${e.property?.title ?? "General"} — ${e.message ?? ""}`,
          }))}
        />
      </section>
      <section>
        <h2 className="font-semibold">Contact</h2>
        <List rows={contacts.map((c) => ({ id: c.id, t: `${c.name} · ${c.email}`, d: c.message }))} />
      </section>
      <section>
        <h2 className="font-semibold">Sell leads</h2>
        <List rows={sellLeads.map((s) => ({ id: s.id, t: `${s.name} · ${s.phone}`, d: s.city ?? "" }))} />
      </section>
      <section>
        <h2 className="font-semibold">Newsletter</h2>
        <List rows={newsletters.map((n) => ({ id: n.id, t: n.email, d: n.createdAt.toISOString() }))} />
      </section>
    </div>
  );
}

function List({ rows }: { rows: { id: string; t: string; d: string }[] }) {
  if (!rows.length) return <p className="mt-2 text-sm text-ink-soft">None yet.</p>;
  return (
    <ul className="mt-3 space-y-2">
      {rows.map((r) => (
        <li key={r.id} className="card-surface p-4">
          <p className="font-medium text-navy">{r.t}</p>
          <p className="text-sm text-ink-soft">{r.d}</p>
        </li>
      ))}
    </ul>
  );
}
