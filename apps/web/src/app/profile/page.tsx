import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { SiteShell } from "@/components/layout/site-shell";
import { ProfileForm } from "@/components/forms/profile-form";

export default async function ProfilePage() {
  const session = await requireUser();
  if (!session) redirect("/login?next=/profile");
  const [user, locations, propertyTypes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { name: true, email: true, phone: true, profilePhotoUrl: true, socialLinks: true },
    }),
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!user) redirect("/login?next=/profile");

  return (
    <SiteShell taxonomies={{ locations, propertyTypes }}>
      <main className="container-px py-28">
        <div className="mx-auto max-w-xl rounded-lg border border-line bg-white p-6">
          <p className="eyebrow">Account</p>
          <h1 className="display mt-2 text-3xl text-navy">Profile</h1>
          <p className="mt-3 text-sm text-ink-soft">View and update your account details.</p>
          <div className="mt-6">
            <ProfileForm user={user} />
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
