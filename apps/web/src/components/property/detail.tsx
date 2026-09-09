"use client";

import { useState } from "react";
import Image from "next/image";
import { formatArea, formatInr, bhkLabel, furnishingLabel, possessionLabel } from "@/lib/format";
import { PropertyCard, type CardProperty } from "./card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const phone = process.env.NEXT_PUBLIC_PHONE || "+91 172 500 4400";
  const wa = process.env.NEXT_PUBLIC_WHATSAPP || "91725004400";

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
    setStatus(res.ok ? "Request received. We’ll call you." : "Could not send.");
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
        <div className="grid gap-2 overflow-hidden rounded-[24px] md:grid-cols-4 md:grid-rows-2 md:h-[520px]">
          {property.images.slice(0, 5).map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setLightbox(i)}
              className={`relative ${i === 0 ? "md:col-span-2 md:row-span-2 min-h-[240px]" : "hidden md:block"}`}
            >
              <Image src={img.url} alt={property.title} fill className="object-cover" />
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="eyebrow">
              {property.propertyType?.name} · {property.city}
            </p>
            <h1 className="display mt-3 text-[clamp(2rem,4vw,3.4rem)] text-navy">{property.title}</h1>
            <p className="mt-3 text-ink-soft">
              {property.locality}, {property.city}
            </p>
            <p className="mt-4 text-3xl font-semibold text-navy">
              {formatInr(property.price, property.transactionType)}
              {property.negotiable ? <span className="ml-2 text-sm font-normal text-ink-soft">Negotiable</span> : null}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {bhkLabel(property.bedrooms) && <Chip>{bhkLabel(property.bedrooms)}</Chip>}
              <Chip>{formatArea(property.area)}</Chip>
              {property.bathrooms ? <Chip>{property.bathrooms} baths</Chip> : null}
              {property.possession && <Chip>{possessionLabel(property.possession)}</Chip>}
              {property.furnishing && <Chip>{furnishingLabel(property.furnishing)}</Chip>}
            </div>
            <p className="mt-8 max-w-2xl leading-relaxed text-ink-soft">{property.description}</p>
            {property.amenities && property.amenities.length > 0 && (
              <>
                <h2 className="mt-10 text-xl font-semibold text-navy">Amenities</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <Chip key={a.name}>{a.name}</Chip>
                  ))}
                </div>
              </>
            )}
            {property.reraNumber && (
              <p className="mt-8 text-sm text-ink-soft">
                RERA {property.reraNumber}
                {property.builder ? ` · ${property.builder.name}` : ""}
              </p>
            )}
            <div className="mt-8 flex gap-3">
              <Button type="button" variant="outline" onClick={share}>
                Share
              </Button>
              <Button href={`https://wa.me/${wa}?text=${encodeURIComponent("Hi, I’m interested in " + property.title)}`}>
                WhatsApp
              </Button>
            </div>
          </div>
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
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="mt-4 block text-sm text-navy">
              Or call {phone}
            </a>
          </aside>
        </div>

        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="display text-3xl text-navy">Similar properties</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {similar.map((p) => (
                <PropertyCard key={p.slug} property={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white p-3 lg:hidden">
        <div className="flex gap-2">
          <Button href={`tel:${phone.replace(/\s/g, "")}`} className="flex-1">
            Call
          </Button>
          <Button href={`https://wa.me/${wa}`} variant="ice" className="flex-1">
            WhatsApp
          </Button>
        </div>
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy/90 p-4">
          <button className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white" onClick={() => setLightbox(null)} aria-label="Close">
            <X />
          </button>
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image src={property.images[lightbox].url} alt={property.title} fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-line bg-white px-3 py-1.5">{children}</span>;
}
