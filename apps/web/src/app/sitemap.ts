import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { PropertyStatus } from "@prisma/client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [properties, locations] = await Promise.all([
    prisma.property.findMany({
      where: { status: PropertyStatus.PUBLISHED, deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.location.findMany({ select: { slug: true } }),
  ]);
  const staticPages = ["", "/properties", "/about", "/contact", "/sell", "/builders", "/locations", "/privacy", "/terms", "/rera"].map(
    (p) => ({ url: `${base}${p || "/"}`, lastModified: new Date() })
  );
  return [
    ...staticPages,
    ...locations.map((l) => ({ url: `${base}/properties/${l.slug}`, lastModified: new Date() })),
    ...properties.map((p) => ({ url: `${base}/property/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
