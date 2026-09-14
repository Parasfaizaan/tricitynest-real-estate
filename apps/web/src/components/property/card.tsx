 "use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { formatArea, bhkLabel, possessionLabel } from "@/lib/format";
import { PriceDisplay } from "@/components/price/price-display";
import { motionDurations, motionEase, staggerItem } from "@/components/motion/variants";

export type CardProperty = {
  id?: string;
  slug: string;
  title: string;
  locality: string;
  city: string;
  price: number | null;
  priceLocked?: boolean;
  transactionType: string;
  bedrooms?: number | null;
  area: number;
  areaUnit?: string;
  featured?: boolean;
  possession?: string;
  tagline?: string | null;
  propertyType?: { name: string };
  images: { url: string; alt?: string | null }[];
};

export function PropertyCard({ property }: { property: CardProperty }) {
  const cover = property.images[0]?.url;
  const reduce = useReducedMotion();
  return (
    <motion.article
      variants={staggerItem}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ duration: motionDurations.button, ease: motionEase }}
      className="group card-surface overflow-hidden transition-colors duration-300 hover:border-ice/70 hover:shadow-[0_20px_50px_rgba(6,24,39,0.08)]"
    >
      <Link href={`/property/${property.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-navy-2">
          {cover && (
            <Image
              src={cover}
              alt={property.images[0]?.alt || property.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.045]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <span className="rounded-full bg-navy/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-ice">
              {property.propertyType?.name ?? property.transactionType}
            </span>
            {property.featured && (
              <span className="rounded-full bg-ice px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-navy">
                Featured
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="space-y-2 p-5">
        <p className="text-xs text-ink-soft">
          {property.locality}, {property.city}
        </p>
        <Link href={`/property/${property.slug}`} className="block">
          <h3 className="display text-[1.2rem] leading-tight text-navy">{property.title}</h3>
        </Link>
        <p className="text-lg font-semibold text-navy">
          <PriceDisplay
            price={property.price}
            priceLocked={property.priceLocked}
            transactionType={property.transactionType}
            property={{ propertyId: property.id, propertySlug: property.slug, propertyTitle: property.title }}
            buttonClassName="min-h-9 px-4 text-xs"
          />
        </p>
        <div className="flex flex-wrap gap-3 pt-1 text-xs text-ink-soft">
          {bhkLabel(property.bedrooms) && <span>{bhkLabel(property.bedrooms)}</span>}
          <span>{formatArea(property.area, property.areaUnit)}</span>
          {property.possession && <span>{possessionLabel(property.possession)}</span>}
        </div>
        <Link href={`/property/${property.slug}`} className="group/link block pt-2 text-sm font-medium text-navy/80">
          View property <span className="inline-block transition duration-200 group-hover/link:translate-x-1">-&gt;</span>
        </Link>
      </div>
    </motion.article>
  );
}
