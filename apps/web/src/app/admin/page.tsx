import { prisma } from "@/lib/prisma";
import { DeletionRequestStatus, LeadStatus, PropertyStatus } from "@prisma/client";
import Link from "next/link";

export default async function AdminHome() {
  const [total, published, draft, leads, newLeads, views, pending, recent] = await Promise.all([
    prisma.property.count({ where: { deletedAt: null } }),
    prisma.property.count({ where: { status: PropertyStatus.PUBLISHED, deletedAt: null } }),
    prisma.property.count({ where: { status: PropertyStatus.DRAFT, deletedAt: null } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: LeadStatus.NEW } }),
    prisma.property.aggregate({ _sum: { views: true } }),
    prisma.propertyDeletionRequest.count({ where: { status: DeletionRequestStatus.PENDING } }),
    prisma.lead.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { preference: true } }),
  ]);
  const cards = [
    { label: "Properties", value: total },
    { label: "Published", value: published },
    { label: "Drafts", value: draft },
    { label: "Leads", value: leads },
    { label: "New leads", value: newLeads },
    { label: "Views", value: views._sum.views ?? 0 },
    { label: "Pending deletes", value: pending },
  ];
  return (
    <div>
      <h1 className="display text-3xl text-navy">Overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-surface p-5">
            <p className="text-xs uppercase tracking-wider text-ink-soft">{c.label}</p>
            <p className="display mt-2 text-3xl text-navy">{c.value}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 text-lg font-semibold text-navy">Recent matcher leads</h2>
      <div className="mt-4 overflow-x-auto card-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Intent</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((l) => (
              <tr key={l.id} className="border-b border-line/70">
                <td className="p-3">{l.name}</td>
                <td className="p-3">{l.phone}</td>
                <td className="p-3">{l.preference?.transactionType}</td>
                <td className="p-3">{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link href="/admin/properties/new" className="mt-8 inline-flex min-h-11 items-center rounded-full bg-navy px-5 text-sm text-white">
        Add property
      </Link>
    </div>
  );
}
