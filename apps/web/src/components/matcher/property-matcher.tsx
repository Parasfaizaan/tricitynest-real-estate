"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tax = {
  locations: { name: string; slug: string }[];
  propertyTypes: { name: string; slug: string; category: string }[];
};

const STORAGE_KEY = "tn_matcher_state";
const CLOSED_KEY = "tn_matcher_closed";

type State = {
  step: number;
  propertyTypes: string[];
  transactionType: "BUY" | "RENT" | "INVEST" | "";
  locationSlugs: string[];
  locQuery: string;
  minBudget: string;
  maxBudget: string;
  bedrooms: number[];
  minArea: string;
  maxArea: string;
  timeline: string;
  name: string;
  phone: string;
  email: string;
  whatsappSame: boolean;
  consent: boolean;
};

const empty: State = {
  step: 1,
  propertyTypes: [],
  transactionType: "",
  locationSlugs: [],
  locQuery: "",
  minBudget: "",
  maxBudget: "",
  bedrooms: [],
  minArea: "",
  maxArea: "",
  timeline: "",
  name: "",
  phone: "",
  email: "",
  whatsappSame: true,
  consent: false,
};

const timelines = ["Immediately", "Within 1 month", "1-3 months", "3-6 months", "Just exploring"];

export function PropertyMatcher({
  open,
  onClose,
  taxonomies,
}: {
  open: boolean;
  onClose: () => void;
  taxonomies: Tax;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") return empty;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? { ...empty, ...JSON.parse(raw) } : empty;
    } catch {
      return empty;
    }
  });
  const [dir, setDir] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function handleClose() {
    try {
      sessionStorage.setItem(CLOSED_KEY, "1");
    } catch {}
    onClose();
  }

  const residential = taxonomies.propertyTypes.filter((t) => t.category === "RESIDENTIAL");
  const commercial = taxonomies.propertyTypes.filter((t) => t.category === "COMMERCIAL");
  const isResidential = state.propertyTypes.some((slug) =>
    residential.some((t) => t.slug === slug)
  );

  const filteredLocs = useMemo(() => {
    const q = state.locQuery.toLowerCase();
    return taxonomies.locations.filter((l) => l.name.toLowerCase().includes(q));
  }, [taxonomies.locations, state.locQuery]);

  function toggle(list: string[] | number[], value: string | number) {
    return list.includes(value as never)
      ? list.filter((v) => v !== value)
      : [...list, value as never];
  }

  function go(next: number) {
    setError("");
    setDir(next > state.step ? 1 : -1);
    setState((s) => ({ ...s, step: next }));
  }

  function validate() {
    if (state.step === 1 && state.propertyTypes.length === 0) return "Select at least one property type.";
    if (state.step === 2 && !state.transactionType) return "Choose buy, rent or invest.";
    if (state.step === 3 && state.locationSlugs.length === 0) return "Select at least one location.";
    if (state.step === 4 && !state.timeline) return "Pick a timeline.";
    if (state.step === 5) {
      if (state.name.trim().length < 2) return "Enter your full name.";
      if (state.phone.trim().length < 8) return "Enter a valid phone.";
      if (!state.email.includes("@")) return "Enter a valid email.";
      if (!state.consent) return "Consent is required.";
    }
    return "";
  }

  async function next() {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    if (state.step < 5) {
      go(state.step + 1);
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/matcher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyTypes: state.propertyTypes,
        transactionType: state.transactionType,
        locationSlugs: state.locationSlugs,
        minBudget: state.minBudget ? Number(state.minBudget) : null,
        maxBudget: state.maxBudget ? Number(state.maxBudget) : null,
        bedrooms: state.bedrooms,
        minArea: state.minArea ? Number(state.minArea) : null,
        maxArea: state.maxArea ? Number(state.maxArea) : null,
        timeline: state.timeline,
        name: state.name,
        phone: state.phone,
        email: state.email,
        whatsapp: state.whatsappSame ? state.phone : undefined,
        consent: state.consent,
      }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not save matches.");
      return;
    }
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem("tn_matches", JSON.stringify(data));
      sessionStorage.setItem(CLOSED_KEY, "1");
    } catch {}
    onClose();
    router.push(`/matches?lead=${data.leadId}`);
  }

  if (!open) return null;

  const typeName = (slug: string) => taxonomies.propertyTypes.find((t) => t.slug === slug)?.name ?? slug;
  const locName = (slug: string) => taxonomies.locations.find((l) => l.slug === slug)?.name ?? slug;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="matcher-title">
      <motion.button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-[#061827]/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-[100svh] w-full max-w-[780px] flex-col overflow-hidden rounded-none bg-[#061827] text-white shadow-2xl sm:h-auto sm:max-h-[90vh] sm:rounded-[26px]"
      >
        <div className="flex items-center justify-between px-6 pb-2 pt-5 sm:px-8">
          <p className="text-sm text-white/60">Question {state.step} of 5</p>
          <button
            ref={closeRef}
            onClick={handleClose}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/15"
            aria-label="Close questionnaire"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-1.5 px-6 sm:px-8">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-ice"
                initial={false}
                animate={{ width: n <= state.step ? "100%" : "0%" }}
                transition={{ duration: 0.35 }}
              />
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={state.step}
              custom={dir}
              initial={reduce ? false : { opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.28 }}
            >
              {state.step === 1 && (
                <>
                  <h2 id="matcher-title" className="display text-[clamp(1.6rem,3vw,2.2rem)]">
                    What type of property are you interested in?
                  </h2>
                  <p className="mt-6 eyebrow text-ice">Residential</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {residential.map((t) => (
                      <Choice key={t.slug} active={state.propertyTypes.includes(t.slug)} onClick={() => setState((s) => ({ ...s, propertyTypes: toggle(s.propertyTypes, t.slug) as string[] }))}>
                        {t.name}
                      </Choice>
                    ))}
                  </div>
                  <p className="mt-6 eyebrow text-ice">Commercial</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {commercial.map((t) => (
                      <Choice key={t.slug} active={state.propertyTypes.includes(t.slug)} onClick={() => setState((s) => ({ ...s, propertyTypes: toggle(s.propertyTypes, t.slug) as string[] }))}>
                        {t.name}
                      </Choice>
                    ))}
                  </div>
                </>
              )}

              {state.step === 2 && (
                <>
                  <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)]">What are you looking to do?</h2>
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {(["BUY", "RENT", "INVEST"] as const).map((v) => (
                      <Choice key={v} active={state.transactionType === v} onClick={() => setState((s) => ({ ...s, transactionType: v }))}>
                        {v === "BUY" ? "Buy" : v === "RENT" ? "Rent" : "Invest"}
                      </Choice>
                    ))}
                  </div>
                </>
              )}

              {state.step === 3 && (
                <>
                  <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)]">Where are you looking?</h2>
                  <input
                    className="mt-6 bg-white/5 text-white"
                    placeholder="Search locations"
                    value={state.locQuery}
                    onChange={(e) => setState((s) => ({ ...s, locQuery: e.target.value }))}
                  />
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {filteredLocs.map((l) => (
                      <Choice key={l.slug} active={state.locationSlugs.includes(l.slug)} onClick={() => setState((s) => ({ ...s, locationSlugs: toggle(s.locationSlugs, l.slug) as string[] }))}>
                        {l.name}
                      </Choice>
                    ))}
                  </div>
                </>
              )}

              {state.step === 4 && (
                <>
                  <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)]">Tell us your requirements</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-white/70">
                      Minimum budget (₹)
                      <input className="mt-2 bg-white/5 text-white" type="number" value={state.minBudget} onChange={(e) => setState((s) => ({ ...s, minBudget: e.target.value }))} />
                    </label>
                    <label className="text-sm text-white/70">
                      Maximum budget (₹)
                      <input className="mt-2 bg-white/5 text-white" type="number" value={state.maxBudget} onChange={(e) => setState((s) => ({ ...s, maxBudget: e.target.value }))} />
                    </label>
                  </div>
                  {isResidential && (
                    <>
                      <p className="mt-6 text-sm text-white/70">BHK</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Choice key={n} compact active={state.bedrooms.includes(n)} onClick={() => setState((s) => ({ ...s, bedrooms: toggle(s.bedrooms, n) as number[] }))}>
                            {n === 5 ? "5+ BHK" : `${n} BHK`}
                          </Choice>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-white/70">
                      Min area (sqft)
                      <input className="mt-2 bg-white/5 text-white" type="number" value={state.minArea} onChange={(e) => setState((s) => ({ ...s, minArea: e.target.value }))} />
                    </label>
                    <label className="text-sm text-white/70">
                      Max area (sqft)
                      <input className="mt-2 bg-white/5 text-white" type="number" value={state.maxArea} onChange={(e) => setState((s) => ({ ...s, maxArea: e.target.value }))} />
                    </label>
                  </div>
                  <p className="mt-6 text-sm text-white/70">Preferred timeline</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {timelines.map((t) => (
                      <Choice key={t} compact active={state.timeline === t} onClick={() => setState((s) => ({ ...s, timeline: t }))}>
                        {t}
                      </Choice>
                    ))}
                  </div>
                </>
              )}

              {state.step === 5 && (
                <>
                  <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)]">Where should we send your matches?</h2>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    {state.propertyTypes.map(typeName).join(", ")} · {state.transactionType} · {state.locationSlugs.map(locName).join(", ")}
                    {state.maxBudget ? ` · up to ₹${Number(state.maxBudget).toLocaleString("en-IN")}` : ""}
                  </div>
                  <div className="mt-5 grid gap-3">
                    <input className="bg-white/5 text-white" placeholder="Full name" value={state.name} onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))} />
                    <input className="bg-white/5 text-white" placeholder="Phone" value={state.phone} onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))} />
                    <input className="bg-white/5 text-white" placeholder="Email" value={state.email} onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))} />
                    <label className="flex items-center gap-2 text-sm text-white/70">
                      <input type="checkbox" className="h-4 w-4" checked={state.whatsappSame} onChange={(e) => setState((s) => ({ ...s, whatsappSame: e.target.checked }))} />
                      WhatsApp same as phone
                    </label>
                    <label className="flex items-start gap-2 text-sm text-white/70">
                      <input type="checkbox" className="mt-1 h-4 w-4" checked={state.consent} onChange={(e) => setState((s) => ({ ...s, consent: e.target.checked }))} />
                      I agree to be contacted about matching properties. Nobody calls until I ask.
                    </label>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4 sm:px-8">
          <button
            type="button"
            className="min-h-11 px-4 text-sm text-white/70 disabled:opacity-30"
            disabled={state.step === 1}
            onClick={() => go(state.step - 1)}
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={busy}
            className="min-h-11 rounded-full bg-ice px-7 text-sm font-semibold text-navy disabled:opacity-60"
          >
            {state.step === 5 ? (busy ? "Matching…" : "Show my matches") : "Continue"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Choice({
  active,
  onClick,
  children,
  compact,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border text-left text-sm font-medium transition",
        compact ? "min-h-11 px-4" : "min-h-[72px] px-4 py-4",
        active ? "border-ice bg-ice/15 text-white" : "border-white/12 bg-white/5 text-white/80 hover:border-white/30"
      )}
    >
      {children}
    </button>
  );
}
