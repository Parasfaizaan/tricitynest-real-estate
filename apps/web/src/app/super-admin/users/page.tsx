import { prisma } from "@/lib/prisma";
import { UserManager } from "@/components/admin/user-manager";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="display text-3xl text-navy">Users</h1>
      <UserManager
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          active: u.active,
        }))}
      />
    </div>
  );
}
