import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { SiteShell } from "@/components/layout/site-shell";
import { SignupForm } from "@/components/forms/signup-form";

export default async function SignupPage() {
  const [locations, propertyTypes] = await Promise.all([
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <SiteShell taxonomies={{ locations, propertyTypes }}>
      <main className="container-px py-28">
        <div className="mx-auto max-w-xl rounded-lg border border-line bg-white p-6">
          <p className="eyebrow">Account</p>
          <h1 className="display mt-2 text-3xl text-navy">Sign up</h1>
          <p className="mt-3 text-sm text-ink-soft">Create your account with phone OTP.</p>
          <div className="mt-6">
            <Suspense>
              <SignupForm />
            </Suspense>
          </div>
          <p className="mt-5 text-sm text-ink-soft">
            Already have an account? <Link href="/login" className="text-navy underline">Login</Link>
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
