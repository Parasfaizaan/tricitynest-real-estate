import { prisma } from "@/lib/prisma";
import { DeletionReview } from "@/components/admin/deletion-review";

export default async function DeletionsPage() {
  const requests = await prisma.propertyDeletionRequest.findMany({
    orderBy: { requestedAt: "desc" },
    include: {
      property: { include: { images: true, location: true } },
      requestedBy: true,
      reviewedBy: true,
    },
  });
  return (
    <div>
      <h1 className="display text-3xl text-navy">Deletion requests</h1>
      <div className="mt-6 space-y-4">
        {requests.map((r) => (
          <div key={r.id} className="card-surface p-5">
            <p className="font-semibold text-navy">{r.property.title}</p>
            <p className="text-sm text-ink-soft">
              {r.property.location.name} · requested by {r.requestedBy.name} · {r.status}
            </p>
            <p className="mt-2 text-sm">{r.reason}</p>
            {r.status === "PENDING" && <DeletionReview id={r.id} />}
            {r.status !== "PENDING" && (
              <p className="mt-2 text-xs text-ink-soft">
                {r.status} by {r.reviewedBy?.name} — {r.reviewNotes}
              </p>
            )}
          </div>
        ))}
        {requests.length === 0 && <p className="text-ink-soft">No requests.</p>}
      </div>
    </div>
  );
}
