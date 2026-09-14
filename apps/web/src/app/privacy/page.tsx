import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/layout/site-shell";

export default async function PrivacyPage() {
  const [locations, types] = await Promise.all([
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <article className="container-px max-w-3xl pt-28 pb-20">
        <h1 className="display text-4xl text-navy">Privacy policy</h1>
        <p className="mt-6 text-ink-soft leading-relaxed">
          tricityinvestment collects name, phone, email and property preferences only to match listings and respond to enquiries. We do not sell personal data. You may request deletion of a lead by writing to hello@tricityinvestment.com.
        </p>
      </article>
    </SiteShell>
  );
}
