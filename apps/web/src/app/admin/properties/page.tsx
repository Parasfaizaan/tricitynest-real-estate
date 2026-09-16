import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatInr } from "@/lib/format";
import { PropertyTableActions } from "@/components/admin/property-table-actions";

type Search = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 10;

export default async function AdminPropertiesPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const rawPage = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number(rawPage ?? 1) || 1);
  const where = { deletedAt: null };
  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        location: true,
        propertyType: true,
        images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1 },
        deletionRequests: { where: { status: "PENDING" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.property.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="display text-3xl text-navy">Properties</h1>
        <Link href="/admin/properties/new" className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold !text-white">
          New listing
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto card-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
            <tr>
              <th className="p-3">Image</th>
              <th className="p-3">Title</th>
              <th className="p-3">City</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-line/70">
                <td className="p-3">
                  {p.images[0]?.url ? (
                    <img src={p.images[0].url} alt="" className="h-14 w-20 rounded-lg object-cover" />
                  ) : (
                    <div className="h-14 w-20 rounded-lg bg-ice/30" />
                  )}
                </td>
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
                  <PropertyTableActions id={p.id} deletionPending={p.deletionRequests.length > 0} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/admin/properties?page=${n}`}
              className={`grid h-10 w-10 place-items-center rounded-full text-sm ${n === page ? "bg-navy text-white" : "border border-line bg-white text-navy"}`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
