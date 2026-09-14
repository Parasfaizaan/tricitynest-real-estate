"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatInr, formatArea, bhkLabel } from "@/lib/format";

type Item = {
  slug: string;
  title: string;
  city: string;
  price: number | null;
  priceLocked?: boolean;
  transactionType: string;
  bedrooms?: number | null;
  area: number;
  possession?: string;
  reraNumber?: string | null;
};

export default function ComparePage() {
  const [items] = useState<Item[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("tn_compare");
      return raw
        ? (JSON.parse(raw) as Item[]).map((item) => ({ ...item, price: null, priceLocked: true }))
        : [];
    } catch {
      return [];
    }
  });
  const [hydrated, setHydrated] = useState<Item[]>(items);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const rows = await Promise.all(
        items.map(async (item) => {
          const res = await fetch(`/api/properties/${item.slug}`, { cache: "no-store" });
          if (!res.ok) return item;
          const data = await res.json();
          return { ...item, ...data.property };
        })
      );
      if (!cancelled) setHydrated(rows);
    }
    if (items.length) hydrate();
    return () => {
      cancelled = true;
    };
  }, [items]);

  if (!items.length) {
    return (
      <div className="container-px pt-28 pb-16">
        <h1 className="display text-4xl text-navy">Compare</h1>
        <p className="mt-4 text-ink-soft">Add homes from listing cards, then return here.</p>
        <Link href="/properties" className="mt-6 inline-block underline">
          Browse properties
        </Link>
      </div>
    );
  }
  return (
    <div className="container-px overflow-x-auto pt-28 pb-16">
      <h1 className="display text-4xl text-navy">Compare</h1>
      <table className="mt-8 min-w-[640px] w-full text-sm">
        <thead>
          <tr>
            <th className="p-3 text-left"> </th>
            {hydrated.map((i) => (
              <th key={i.slug} className="p-3 text-left">
                <Link href={`/property/${i.slug}`} className="text-navy">
                  {i.title}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ["City", (i: Item) => i.city],
            ["Price", (i: Item) => (i.priceLocked || typeof i.price !== "number" ? "Price on Request" : formatInr(i.price, i.transactionType))],
            ["BHK", (i: Item) => bhkLabel(i.bedrooms) ?? "-"],
            ["Area", (i: Item) => formatArea(i.area)],
            ["Possession", (i: Item) => i.possession ?? "-"],
            ["RERA", (i: Item) => i.reraNumber ?? "-"],
          ].map(([label, fn]) => (
            <tr key={String(label)} className="border-t border-line">
              <td className="p-3 font-medium">{label as string}</td>
              {hydrated.map((i) => (
                <td key={i.slug} className="p-3">
                  {(fn as (i: Item) => string)(i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
