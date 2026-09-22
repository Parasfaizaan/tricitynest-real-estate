 "use client";

import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
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

export function PropertyCard({ property, reveal = true }: { property: CardProperty; reveal?: boolean }) {
  const cover = property.images[0]?.url;
  const reduce = useReducedMotion();
  const shouldReveal = reveal && !reduce;
  return (
    <motion.article
      variants={staggerItem}
      initial={shouldReveal ? "hidden" : false}
      whileInView={shouldReveal ? "show" : undefined}
      viewport={shouldReveal ? { once: true, margin: "-50px" } : undefined}
      whileHover={reduce ? undefined : { y: -3 }}
      transition={{ duration: motionDurations.button, ease: motionEase }}
      className="group relative card-surface overflow-hidden transition-colors duration-300 hover:border-ice/70 hover:shadow-[0_20px_50px_rgba(16,37,31,0.1)]"
    >
      <Link
        href={`/property/${property.slug}`}
        aria-label={`View ${property.title}`}
        className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice focus-visible:ring-offset-2"
      />
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
      <div className="space-y-2 p-5">
        <p className="text-xs text-ink-soft">
          {property.locality}, {property.city}
        </p>
        <h3 className="display text-[1.2rem] leading-tight text-navy">{property.title}</h3>
        <div className={`${property.priceLocked ? "relative z-20" : ""} text-lg font-semibold text-navy`}>
          <PriceDisplay
            price={property.price}
            priceLocked={property.priceLocked}
            transactionType={property.transactionType}
            property={{ propertyId: property.id, propertySlug: property.slug, propertyTitle: property.title }}
            buttonLabel="Request Price"
            buttonClassName="min-h-9 px-4 text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-3 pt-1 text-xs text-ink-soft">
          {bhkLabel(property.bedrooms) && <span>{bhkLabel(property.bedrooms)}</span>}
          <span>{formatArea(property.area, property.areaUnit)}</span>
          {property.possession && <span>{possessionLabel(property.possession)}</span>}
        </div>
        {property.priceLocked && (
          <p className="inline-flex items-center gap-1.5 pt-2 text-xs font-medium text-ink-soft">
            <Lock size={13} />
            Login or request access to view price
          </p>
        )}
      </div>
    </motion.article>
  );
}
