import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { UserManager } from "@/components/admin/user-manager";

type Search = Promise<Record<string, string | string[] | undefined>>;

const PAGE_SIZE = 10;

export default async function AdminUsersPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const currentUser = await requireUser();
  const rawPage = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number(rawPage ?? 1) || 1);
  const where = {
    role: { not: "SUPER_ADMIN" as const },
    NOT: { email: { endsWith: "@deleted.local" } },
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);
  return (
    <div>
      <h1 className="display text-3xl text-navy">Users</h1>
      <UserManager
        currentUserId={currentUser?.id ?? ""}
        currentUserRole={currentUser?.role ?? "USER"}
        page={page}
        pages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          profilePhotoUrl: u.profilePhotoUrl,
          socialLinks: u.socialLinks,
          role: u.role,
          active: u.active,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
