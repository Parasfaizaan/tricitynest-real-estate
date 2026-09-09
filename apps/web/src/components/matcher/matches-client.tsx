"use client";

import { useState } from "react";
import { PropertyCard, type CardProperty } from "@/components/property/card";

export function MatchesClient({ serverMatches }: { serverMatches: unknown[] }) {
  const [matches] = useState<CardProperty[]>(() => {
    if (serverMatches.length) return serverMatches as CardProperty[];
    if (typeof window === "undefined") return [];
    try {
      const raw = sessionStorage.getItem("tn_matches");
      if (raw) {
        const data = JSON.parse(raw);
        return data.matches ?? [];
      }
    } catch {}
    return [];
  });

  return (
    <div className="container-px pt-28 pb-16">
      <p className="eyebrow">Your shortlist</p>
      <h1 className="display mt-3 text-[clamp(2rem,4vw,3.4rem)] text-navy">Properties that fit</h1>
      {matches.length === 0 ? (
        <p className="mt-8 text-ink-soft">No matches yet. Try the questionnaire again from the header.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((p) => (
            <PropertyCard key={p.slug} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
