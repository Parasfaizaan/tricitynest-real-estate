import { redirect } from "next/navigation";
import { requireUser, isStaff } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user || !isStaff(user.role)) redirect("/login?next=/admin");
  return (
    <AdminShell role={user.role} name={user.name}>
      {children}
    </AdminShell>
  );
}
