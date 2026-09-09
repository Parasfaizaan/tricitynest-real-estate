import Image from "next/image";
import Link from "next/link";
import { formatArea, formatInr, bhkLabel, possessionLabel } from "@/lib/format";

export type CardProperty = {
  slug: string;
  title: string;
  locality: string;
  city: string;
  price: number;
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
  return (
    <Link
      href={`/property/${property.slug}`}
      className="group card-surface block overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(6,24,39,0.08)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-2">
        {cover && (
          <Image
            src={cover}
            alt={property.images[0]?.alt || property.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
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
        <p className="text-lg font-semibold text-navy">{formatInr(property.price, property.transactionType)}</p>
        <div className="flex flex-wrap gap-3 pt-1 text-xs text-ink-soft">
          {bhkLabel(property.bedrooms) && <span>{bhkLabel(property.bedrooms)}</span>}
          <span>{formatArea(property.area, property.areaUnit)}</span>
          {property.possession && <span>{possessionLabel(property.possession)}</span>}
        </div>
        <p className="pt-2 text-sm font-medium text-navy/80">View property →</p>
      </div>
    </Link>
  );
}
