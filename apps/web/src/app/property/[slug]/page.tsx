import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { propertyInclude, serializeProperty } from "@/lib/property-query";
import { hasPriceAccess } from "@/lib/price-access";
import { PropertyStatus } from "@prisma/client";
import { SiteShell } from "@/components/layout/site-shell";
import { PropertyDetail } from "@/components/property/detail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await prisma.property.findFirst({ where: { slug, deletedAt: null } });
  if (!p) return { title: "Property" };
  return {
    title: p.title,
    description: p.shortDescription,
    openGraph: { title: p.title, description: p.shortDescription, images: [] },
    alternates: { canonical: `/property/${slug}` },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await prisma.property.findFirst({
    where: { slug, status: PropertyStatus.PUBLISHED, deletedAt: null },
    include: propertyInclude,
  });
  if (!property) notFound();
  await prisma.property.update({ where: { id: property.id }, data: { views: { increment: 1 } } });
  const similar = await prisma.property.findMany({
    where: {
      id: { not: property.id },
      status: PropertyStatus.PUBLISHED,
      deletedAt: null,
      OR: [{ locationId: property.locationId }, { propertyTypeId: property.propertyTypeId }],
    },
    include: propertyInclude,
    take: 3,
  });
  const [locations, types, canViewPrice] = await Promise.all([
    prisma.location.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    hasPriceAccess(),
  ]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.shortDescription,
    url: `/property/${property.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city,
      addressRegion: property.state,
    },
  };

  return (
    <SiteShell taxonomies={{ locations, propertyTypes: types }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PropertyDetail
        property={serializeProperty(property, canViewPrice)}
        similar={similar.map((item) => serializeProperty(item, canViewPrice))}
      />
    </SiteShell>
  );
}
