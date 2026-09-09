import { prisma } from "@/lib/prisma";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { actor: true },
  });
  return (
    <div>
      <h1 className="display text-3xl text-navy">Audit log</h1>
      <ul className="mt-6 space-y-2">
        {logs.map((l) => (
          <li key={l.id} className="card-surface p-4 text-sm">
            <p className="font-medium text-navy">{l.action}</p>
            <p className="text-ink-soft">
              {l.entityType} {l.entityId ?? ""} · {l.actor?.email ?? "system"} · {l.createdAt.toISOString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
