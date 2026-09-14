"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PropertyCard, type CardProperty } from "@/components/property/card";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { motionDurations, motionEase } from "@/components/motion/variants";

type Loc = { name: string; slug: string };
type Type = { name: string; slug: string; category: string };

export function PropertiesBrowser({
  initial,
  total,
  page,
  pages,
  locations,
  types,
  filters,
}: {
  initial: CardProperty[];
  total: number;
  page: number;
  pages: number;
  locations: Loc[];
  types: Type[];
  filters: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    transaction: filters.transaction ?? "",
    category: filters.category ?? "",
    type: filters.type ?? "",
    location: filters.location ?? "",
    bhk: filters.bhk ?? "",
    minPrice: filters.minPrice ?? "",
    maxPrice: filters.maxPrice ?? "",
    minArea: filters.minArea ?? "",
    maxArea: filters.maxArea ?? "",
    possession: filters.possession ?? "",
    furnishing: filters.furnishing ?? "",
    sort: filters.sort ?? "newest",
    q: filters.q ?? "",
  });

  function apply(extra?: Record<string, string>) {
    const merged = { ...form, ...extra };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`/properties?${params.toString()}`);
    setOpen(false);
  }

  const FilterFields = (
      <div className="grid gap-3">
        <input placeholder="Search" value={form.q} onChange={(e) => setForm({ ...form, q: e.target.value })} />
        <select value={form.transaction} onChange={(e) => setForm({ ...form, transaction: e.target.value })}>
          <option value="">Buy / Rent / Invest</option>
          <option value="buy">Buy</option>
          <option value="rent">Rent</option>
          <option value="invest">Invest</option>
        </select>
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="">Residential / Commercial</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </select>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="">Property type</option>
          {types.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
        <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
          <option value="">Location</option>
          {locations.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.name}
            </option>
          ))}
        </select>
        <select value={form.bhk} onChange={(e) => setForm({ ...form, bhk: e.target.value })}>
          <option value="">BHK</option>
          <option value="1">1 BHK</option>
          <option value="2">2 BHK</option>
          <option value="3">3 BHK</option>
          <option value="4">4 BHK</option>
          <option value="5">5+ BHK</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Min price" type="number" value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })} />
          <input placeholder="Max price" type="number" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input placeholder="Min area" type="number" value={form.minArea} onChange={(e) => setForm({ ...form, minArea: e.target.value })} />
          <input placeholder="Max area" type="number" value={form.maxArea} onChange={(e) => setForm({ ...form, maxArea: e.target.value })} />
        </div>
        <select value={form.possession} onChange={(e) => setForm({ ...form, possession: e.target.value })}>
          <option value="">Possession</option>
          <option value="ready">Ready</option>
          <option value="under-construction">Under construction</option>
          <option value="new-launch">New launch</option>
        </select>
        <select value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })}>
          <option value="">Furnishing</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi_furnished">Semi furnished</option>
          <option value="furnished">Furnished</option>
        </select>
        <select value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price low to high</option>
          <option value="price-desc">Price high to low</option>
          <option value="featured">Featured</option>
        </select>
        <Button type="button" onClick={() => apply()}>
          Apply filters
        </Button>
      </div>
  );

  return (
    <div className="pt-24">
      <div className="container-px py-10">
        <p className="eyebrow">The collection</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="display text-[clamp(2rem,4vw,3.6rem)] text-navy">Properties</h1>
          <p className="text-sm text-ink-soft">{total} listings</p>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="card-surface sticky top-28 p-5">{FilterFields}</div>
          </aside>
          <div>
            <div className="mb-4 flex lg:hidden">
              <Button variant="outline" type="button" onClick={() => setOpen(true)}>
                <SlidersHorizontal size={16} /> Filters
              </Button>
            </div>
            {initial.length === 0 ? (
              <div className="card-surface p-12 text-center text-ink-soft">No properties match these filters.</div>
            ) : (
              <Stagger className="grid gap-6 sm:grid-cols-2">
                {initial.map((p) => (
                  <StaggerItem key={p.slug}>
                    <PropertyCard property={p} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
            {pages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => apply({ page: String(n) })}
                    className={`h-11 w-11 rounded-full ${n === page ? "bg-navy text-white" : "border border-line bg-white"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-navy/50 p-4 backdrop-blur-sm lg:hidden"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: motionDurations.button, ease: motionEase }}
        >
          <motion.div
            className="ml-auto h-full max-w-sm overflow-y-auto rounded-[22px] bg-white p-5"
            initial={reduce ? false : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: 24 }}
            transition={{ duration: motionDurations.modal, ease: motionEase }}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">Filters</p>
              <button onClick={() => setOpen(false)} aria-label="Close filters" className="grid h-11 w-11 place-items-center">
                <X size={18} />
              </button>
            </div>
            {FilterFields}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
