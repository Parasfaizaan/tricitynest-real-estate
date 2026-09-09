import { prisma } from "@/lib/prisma";
import { DeletionRequestStatus } from "@prisma/client";
import Link from "next/link";

export default async function SuperHome() {
  const [users, pending, logs] = await Promise.all([
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }),
    prisma.propertyDeletionRequest.count({ where: { status: DeletionRequestStatus.PENDING } }),
    prisma.auditLog.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { actor: true } }),
  ]);
  return (
    <div>
      <h1 className="display text-3xl text-navy">Super admin</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-5">
          <p className="text-xs text-ink-soft">Staff accounts</p>
          <p className="display mt-2 text-3xl">{users}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-xs text-ink-soft">Pending deletions</p>
          <p className="display mt-2 text-3xl">{pending}</p>
          <Link href="/super-admin/deletions" className="mt-2 inline-block text-sm underline">
            Review
          </Link>
        </div>
      </div>
      <h2 className="mt-10 font-semibold">Latest audit</h2>
      <ul className="mt-3 space-y-2">
        {logs.map((l) => (
          <li key={l.id} className="card-surface p-3 text-sm">
            {l.action} · {l.entityType} · {l.actor?.email ?? "system"}
          </li>
        ))}
      </ul>
    </div>
  );
}
