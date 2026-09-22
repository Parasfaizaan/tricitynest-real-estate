"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { formatArea, bhkLabel, furnishingLabel, possessionLabel } from "@/lib/format";
import { PropertyCard, type CardProperty } from "./card";
import { Button } from "@/components/ui/button";
import {
  Bath,
  Building2,
  Car,
  Dumbbell,
  Home,
  MessageCircle,
  Phone,
  Search,
  Share2,
  ShieldCheck,
  Snowflake,
  Trees,
  Waves,
  X,
  type LucideIcon,
} from "lucide-react";
import { PriceDisplay } from "@/components/price/price-display";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { motionDurations, motionEase } from "@/components/motion/variants";

type Prop = CardProperty & {
  id: string;
  description: string;
  shortDescription: string;
  reraNumber?: string | null;
  furnishing?: string;
  bathrooms?: number | null;
  balconies?: number | null;
  address?: string;
  amenities?: { name: string }[];
  features?: { label: string }[];
  floorPlans?: { title: string; imageUrl: string }[];
  builder?: { name: string } | null;
  negotiable?: boolean;
};

export function PropertyDetail({ property, similar }: { property: Prop; similar: CardProperty[] }) {
  const reduce = useReducedMotion();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const phone = process.env.NEXT_PUBLIC_PHONE || "+91 172 500 4400";
  const wa = process.env.NEXT_PUBLIC_WHATSAPP || "91725004400";
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const whatsappHref = `https://wa.me/${wa}?text=${encodeURIComponent("Hi, I'm interested in " + property.title)}`;
  const galleryImages = property.images.slice(0, 5);
  const fallbackImage = galleryImages[0];

  async function onEnquire(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId: property.id,
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        message: fd.get("message"),
      }),
    });
    setStatus(res.ok ? "Request received. We'll call you." : "Could not send.");
    if (res.ok) e.currentTarget.reset();
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: property.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setStatus("Link copied.");
    }
  }

  return (
    <div className="pt-24">
      <div className="container-px py-8">
        <Reveal>
          <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="display max-w-4xl text-[clamp(2.3rem,5vw,4.2rem)] leading-[0.95] text-navy">{property.title}</h1>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={share} className="min-h-10 px-4">
                  <Share2 size={16} />
                  Share
                </Button>
                <Button variant="outline" href={whatsappHref} className="min-h-10 px-4">
                  <MessageCircle size={16} />
                  WhatsApp
                </Button>
              </div>
            </div>

            <div className="grid gap-3 overflow-hidden rounded-[18px] md:h-[430px] md:grid-cols-[1.08fr_1fr]">
              <GalleryTile
                image={fallbackImage}
                title={property.title}
                index={0}
                setLightbox={setLightbox}
                className="aspect-[4/3] md:aspect-auto"
                priority
              >
                <span className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-2 rounded-md bg-black px-3 py-2 text-white shadow-lg">
                  <Search size={17} />
                </span>
              </GalleryTile>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((slot) => (
                  <GalleryTile
                    key={slot}
                    image={galleryImages[slot] ?? fallbackImage}
                    title={property.title}
                    index={Math.min(slot, Math.max(galleryImages.length - 1, 0))}
                    setLightbox={setLightbox}
                    className="aspect-[4/3] md:aspect-auto"
                  >
                    {slot === 4 && property.images.length > 5 ? (
                      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white px-7 py-3 text-xs font-semibold text-navy shadow-lg">
                        Show all
                      </span>
                    ) : null}
                  </GalleryTile>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <Reveal>
            <p className="eyebrow">
              {property.propertyType?.name} - {property.city}
            </p>
            <p className="mt-3 text-ink-soft">
              {property.locality}, {property.city}
            </p>
            <p className="mt-4 text-3xl font-semibold text-navy">
              <PriceDisplay
                price={property.price}
                priceLocked={property.priceLocked}
                transactionType={property.transactionType}
                property={{ propertyId: property.id, propertySlug: property.slug, propertyTitle: property.title }}
              />
              {!property.priceLocked && property.negotiable ? <span className="ml-2 text-sm font-normal text-ink-soft">Negotiable</span> : null}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {bhkLabel(property.bedrooms) && <Chip>{bhkLabel(property.bedrooms)}</Chip>}
              <Chip>{formatArea(property.area, property.areaUnit)}</Chip>
              {property.bathrooms ? <Chip>{property.bathrooms} baths</Chip> : null}
              {property.possession && <Chip>{possessionLabel(property.possession)}</Chip>}
              {property.furnishing && <Chip>{furnishingLabel(property.furnishing)}</Chip>}
            </div>
            <p className="mt-8 max-w-2xl leading-relaxed text-ink-soft">{property.description}</p>
            {property.amenities && property.amenities.length > 0 && (
              <>
                <h2 className="mt-10 text-xl font-semibold text-navy">Amenities</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {property.amenities.map((a) => (
                    <AmenityTile key={a.name} name={a.name} />
                  ))}
                </div>
              </>
            )}
            {property.features && property.features.length > 0 && (
              <>
                <h2 className="mt-10 text-xl font-semibold text-navy">Features</h2>
                <div className="mt-4 grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
                  {property.features.map((feature) => (
                    <p key={feature.label} className="rounded-lg border border-line bg-white px-3 py-2">
                      {feature.label}
                    </p>
                  ))}
                </div>
              </>
            )}
            {property.reraNumber && (
              <p className="mt-8 text-sm text-ink-soft">
                RERA {property.reraNumber}
                {property.builder ? ` - ${property.builder.name}` : ""}
              </p>
            )}
          </Reveal>
          <Reveal delay={0.1}>
          <aside className="card-surface h-fit p-6">
            <h2 className="font-semibold text-navy">Request a callback</h2>
            <form onSubmit={onEnquire} className="mt-4 grid gap-3">
              <input name="name" required placeholder="Name" />
              <input name="phone" required placeholder="Phone" />
              <input name="email" type="email" placeholder="Email" />
              <textarea name="message" rows={3} placeholder="Message" />
              <Button type="submit">Send request</Button>
            </form>
            {status && <p className="mt-3 text-sm text-ink-soft">{status}</p>}
            <a href={phoneHref} className="mt-4 flex min-h-11 items-center gap-2 rounded-xl border border-ice bg-page px-4 text-sm font-semibold text-navy transition hover:border-navy/25">
              <Phone size={16} />
              Or call {phone}
            </a>
          </aside>
          </Reveal>
        </div>

        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="display text-3xl text-navy">Similar properties</h2>
            <Stagger className="mt-6 grid gap-6 md:grid-cols-3">
              {similar.map((p) => (
                <StaggerItem key={p.slug}>
                  <PropertyCard property={p} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white p-3 lg:hidden">
        <div className="flex gap-2">
          <Button href={phoneHref} className="flex-1">
            <Phone size={17} />
            Call
          </Button>
          <Button href={whatsappHref} variant="ice" className="flex-1">
            <MessageCircle size={17} />
            WhatsApp
          </Button>
        </div>
      </div>

      <AnimatePresence>
      {lightbox !== null && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-navy/90 p-4 backdrop-blur-sm"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: motionDurations.button, ease: motionEase }}
        >
          <button className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/15" onClick={() => setLightbox(null)} aria-label="Close">
            <X />
          </button>
          <motion.div
            className="relative h-[80vh] w-full max-w-5xl"
            initial={reduce ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
            transition={{ duration: motionDurations.modal, ease: motionEase }}
          >
            <Image src={property.images[lightbox].url} alt={property.title} fill className="object-contain" />
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

function GalleryTile({
  image,
  title,
  index,
  setLightbox,
  className,
  priority = false,
  children,
}: {
  image?: { url: string; alt?: string | null };
  title: string;
  index: number;
  setLightbox: (index: number) => void;
  className?: string;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  if (!image) {
    return <div className={`relative overflow-hidden bg-navy/10 ${className ?? ""}`} />;
  }

  return (
    <button
      type="button"
      onClick={() => setLightbox(index)}
      aria-label={`Open ${title} image ${index + 1}`}
      className={`group relative overflow-hidden bg-navy/10 text-left ${className ?? ""}`}
    >
      <Image
        src={image.url}
        alt={image.alt || title}
        fill
        className="object-cover transition duration-500 group-hover:scale-[1.035]"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
      />
      <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      {children}
    </button>
  );
}

function AmenityTile({ name }: { name: string }) {
  const Icon = iconForAmenity(name);
  return (
    <div className="flex min-h-24 items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 shadow-[0_10px_24px_rgba(16,37,31,0.04)]">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-page text-navy">
        <Icon size={26} strokeWidth={1.8} />
      </span>
      <span className="text-sm font-medium leading-snug text-navy/75">{name}</span>
    </div>
  );
}

function iconForAmenity(name: string): LucideIcon {
  const value = name.toLowerCase();
  if (value.includes("pool") || value.includes("swim")) return Waves;
  if (value.includes("gym") || value.includes("fitness")) return Dumbbell;
  if (value.includes("park") || value.includes("garden")) return Trees;
  if (value.includes("parking") || value.includes("car")) return Car;
  if (value.includes("air") || value.includes("ac")) return Snowflake;
  if (value.includes("bath") || value.includes("wash")) return Bath;
  if (value.includes("club")) return Home;
  if (value.includes("security") || value.includes("guard")) return ShieldCheck;
  return Building2;
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-line bg-white px-3 py-1.5">{children}</span>;
}
