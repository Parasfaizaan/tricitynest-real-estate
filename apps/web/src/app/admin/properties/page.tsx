import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";

export default async function AdminPropertiesPage() {
  const items = await prisma.property.findMany({
    where: { deletedAt: null },
    include: {
      location: true,
      propertyType: true,
      deletionRequests: { where: { status: "PENDING" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="display text-3xl text-navy">Properties</h1>
        <Link href="/admin/properties/new" className="rounded-full bg-navy px-5 py-2.5 text-sm text-white">
          New listing
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto card-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">City</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-line/70">
                <td className="p-3">
                  {p.title}
                  {p.deletionRequests.length > 0 && (
                    <span className="ml-2 rounded-full bg-ice/40 px-2 py-0.5 text-[11px]">Deletion pending</span>
                  )}
                </td>
                <td className="p-3">{p.city}</td>
                <td className="p-3">{formatInr(p.price, p.transactionType)}</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">
                  <Link href={`/admin/properties/${p.id}`} className="text-navy underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
