import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/layout/site-shell";

export default async function AboutPage() {
  const [locations, types] = await Promise.all([
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <div className="container-px max-w-3xl pt-28 pb-20">
        <p className="eyebrow">About</p>
        <h1 className="display mt-3 text-[clamp(2.2rem,5vw,4rem)] text-navy">Quiet inventory. Honest prices.</h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-soft">
          TricityNest is an independent property studio for Mohali, Chandigarh, Zirakpur, Kharar, New Chandigarh, Derabassi and Banur. We photograph every listing, publish the number we would pay, and match you in five questions — not fifty WhatsApp forwards.
        </p>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Founded as a corridor-first advisory, we work with a small set of builders and private sellers. If a home is not ready to be shown, it is not on this site.
        </p>
      </div>
    </SiteShell>
  );
}
