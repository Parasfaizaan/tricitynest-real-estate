import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/layout/site-shell";
import { ContactForm } from "@/components/forms/contact-form";

export default async function ContactPage() {
  const [locations, types] = await Promise.all([
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <div className="container-px grid gap-10 pt-28 pb-20 md:grid-cols-2">
        <div>
          <p className="eyebrow">Contact</p>
          <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.6rem)] text-navy">Write to the desk</h1>
          <p className="mt-4 text-ink-soft">hello@tricityinvestment.com · +91 172 500 4400</p>
          <p className="mt-2 text-ink-soft">SCO 42, Sector 82, Mohali</p>
        </div>
        <ContactForm />
      </div>
    </SiteShell>
  );
}
