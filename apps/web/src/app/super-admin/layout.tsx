import { redirect } from "next/navigation";
import { requireUser, isSuper } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function SuperLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user || !isSuper(user.role)) redirect("/login?next=/super-admin");
  return (
    <AdminShell role={user.role} name={user.name}>
      {children}
    </AdminShell>
  );
}
