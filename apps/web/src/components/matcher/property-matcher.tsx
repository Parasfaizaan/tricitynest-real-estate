"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  BriefcaseBusiness,
  Building,
  Building2,
  CalendarClock,
  Check,
  Home,
  House,
  IndianRupee,
  LandPlot,
  Mail,
  MapPin,
  PanelsTopLeft,
  Phone,
  Ruler,
  ShoppingBag,
  Store,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tax = {
  locations: { name: string; slug: string }[];
  propertyTypes: { name: string; slug: string; category: string }[];
};

const STORAGE_KEY = "tn_matcher_state";
const CLOSED_KEY = "tn_matcher_closed";

type State = {
  step: number;
  propertyCategory: "RESIDENTIAL" | "COMMERCIAL" | "";
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
  propertyCategory: "",
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
const phoneRegex = /^(?:\+91[\s-]?|91[\s-]?|0)?[6-9]\d{9}$/;
const TOTAL_STEPS = 6;

const budgetConfigs = {
  BUY: { min: 1_000_000, max: 100_000_000, step: 500_000 },
  INVEST: { min: 1_000_000, max: 100_000_000, step: 500_000 },
  RENT: { min: 10_000, max: 500_000, step: 5_000 },
} as const;

const areaConfigs = {
  RESIDENTIAL: { min: 250, max: 10_000, step: 50 },
  COMMERCIAL: { min: 100, max: 50_000, step: 100 },
} as const;

const bedroomTypes = new Set(["apartment", "builder-floor", "villa"]);

const stepIcons: Record<number, LucideIcon> = {
  1: Home,
  2: Building2,
  3: BriefcaseBusiness,
  4: MapPin,
  5: IndianRupee,
  6: UserRound,
};

const typeIcons: Record<string, LucideIcon> = {
  apartment: Building2,
  "builder-floor": PanelsTopLeft,
  villa: House,
  plot: LandPlot,
  sco: Store,
  shop: ShoppingBag,
  showroom: Store,
  office: BriefcaseBusiness,
  "commercial-plot": LandPlot,
};

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
      return raw ? normalizeSavedState({ ...empty, ...JSON.parse(raw) }) : empty;
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
  const availableTypes = state.propertyCategory === "COMMERCIAL" ? commercial : residential;
  const isResidential = state.propertyCategory === "RESIDENTIAL";
  const showBhk = isResidential && state.propertyTypes.some((slug) => bedroomTypes.has(slug));

  const filteredLocs = useMemo(() => {
    const q = state.locQuery.toLowerCase();
    return taxonomies.locations.filter((l) => l.name.toLowerCase().includes(q));
  }, [taxonomies.locations, state.locQuery]);

  function toggle(list: string[] | number[], value: string | number) {
    return list.includes(value as never)
      ? list.filter((v) => v !== value)
      : [...list, value as never];
  }

  function chooseCategory(propertyCategory: State["propertyCategory"]) {
    setError("");
    setState((s) => ({
      ...s,
      propertyCategory,
      propertyTypes: s.propertyCategory === propertyCategory ? s.propertyTypes : [],
      bedrooms: propertyCategory === "RESIDENTIAL" ? s.bedrooms : [],
    }));
  }

  function chooseTransaction(transactionType: State["transactionType"]) {
    const nextBudget = budgetConfigs[transactionType || "BUY"];
    setState((s) => ({
      ...s,
      transactionType,
      minBudget: String(nextBudget.min),
      maxBudget: String(nextBudget.max),
    }));
  }

  function chooseType(slug: string) {
    setState((s) => {
      const nextTypes = toggle(s.propertyTypes, slug) as string[];
      return {
        ...s,
        propertyTypes: nextTypes,
        bedrooms: s.propertyCategory === "RESIDENTIAL" && nextTypes.some((type) => bedroomTypes.has(type)) ? s.bedrooms : [],
      };
    });
  }

  function go(nextStep: number) {
    setError("");
    setDir(nextStep > state.step ? 1 : -1);
    setState((s) => ({ ...s, step: nextStep }));
  }

  function validate() {
    if (state.step === 1 && !state.propertyCategory) return "Select one option.";
    if (state.step === 2 && state.propertyTypes.length === 0) return "Select at least one property type.";
    if (state.step === 3 && !state.transactionType) return "Choose buy, rent or invest.";
    if (state.step === 4 && state.locationSlugs.length === 0) return "Select at least one location.";
    if (state.step === 5) {
      const budget = getBudgetValues(state);
      const area = getAreaValues(state);
      if (budget[0] > budget[1]) return "Minimum budget cannot exceed maximum budget.";
      if (area[0] > area[1]) return "Minimum area cannot exceed maximum area.";
      if (!state.timeline) return "Pick a timeline.";
    }
    if (state.step === 6) {
      if (state.name.trim().length < 2) return "Enter your full name.";
      if (!phoneRegex.test(state.phone.trim())) return "Enter a valid Indian mobile number.";
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
    if (state.step < TOTAL_STEPS) {
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
  const StepIcon = stepIcons[state.step] ?? Home;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="matcher-title">
      <motion.button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-[rgba(2,15,25,0.72)] backdrop-blur-[12px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={handleClose}
      />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-h-[calc(100dvh-24px)] w-[min(690px,calc(100vw-24px))] overflow-y-auto rounded-[24px] border border-[rgba(170,215,240,0.12)] bg-[#061827] px-5 py-5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.34)] [scrollbar-color:rgba(168,216,245,0.35)_transparent] [scrollbar-width:thin] sm:max-h-[calc(100vh-64px)] sm:w-[min(690px,calc(100vw-48px))] sm:px-11 sm:py-10"
      >
        <button
          ref={closeRef}
          onClick={handleClose}
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/[0.03] text-white/80 transition hover:border-ice/30 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice sm:right-5 sm:top-5"
          aria-label="Close questionnaire"
        >
          <X size={20} />
        </button>

        <div className="flex gap-1.5 pr-14">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <div key={n} className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-ice"
                initial={false}
                animate={{ width: n <= state.step ? "100%" : "0%" }}
                transition={{ duration: 0.28 }}
              />
            </div>
          ))}
        </div>

        <div className="mt-8">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={state.step}
              custom={dir}
              initial={reduce ? false : { opacity: 0, x: dir > 0 ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: dir > 0 ? -20 : 20 }}
              transition={{ duration: 0.24 }}
            >
              {state.step === 1 && (
                <CenteredStep
                  icon={StepIcon}
                  step={state.step}
                  title="What type of property are you interested in?"
                  description="Select one option"
                >
                  <div className="mx-auto mt-8 grid max-w-[560px] gap-4 sm:grid-cols-2">
                    <CategoryCard
                      icon={Home}
                      title="Residential"
                      description="Villas, flats, and residential plots"
                      active={state.propertyCategory === "RESIDENTIAL"}
                      onClick={() => chooseCategory("RESIDENTIAL")}
                    />
                    <CategoryCard
                      icon={Building2}
                      title="Commercial"
                      description="SCOs, showrooms, and commercial plots"
                      active={state.propertyCategory === "COMMERCIAL"}
                      onClick={() => chooseCategory("COMMERCIAL")}
                    />
                  </div>
                </CenteredStep>
              )}

              {state.step === 2 && (
                <CenteredStep
                  icon={StepIcon}
                  step={state.step}
                  title={`Choose ${state.propertyCategory === "COMMERCIAL" ? "commercial" : "residential"} property types`}
                  description="Select one or more options"
                >
                  <div className="mx-auto mt-7 grid max-w-[560px] gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {availableTypes.map((t) => {
                      const Icon = typeIcons[t.slug] ?? Building;
                      return (
                        <Choice
                          key={t.slug}
                          icon={Icon}
                          compact
                          active={state.propertyTypes.includes(t.slug)}
                          onClick={() => chooseType(t.slug)}
                        >
                          {t.name}
                        </Choice>
                      );
                    })}
                  </div>
                </CenteredStep>
              )}

              {state.step === 3 && (
                <CenteredStep
                  icon={StepIcon}
                  step={state.step}
                  title="What are you looking to do?"
                  description="Choose the transaction type"
                >
                  <div className="mx-auto mt-7 grid max-w-[520px] gap-3 sm:grid-cols-3">
                    {(["BUY", "RENT", "INVEST"] as const).map((v) => (
                      <Choice
                        key={v}
                        active={state.transactionType === v}
                        onClick={() => chooseTransaction(v)}
                      >
                        {v === "BUY" ? "Buy" : v === "RENT" ? "Rent" : "Invest"}
                      </Choice>
                    ))}
                  </div>
                </CenteredStep>
              )}

              {state.step === 4 && (
                <>
                  <StepHeader icon={StepIcon} step={state.step} title="Where should we look?" description="Choose one or more locations that work for you." />
                  <div className="mt-6">
                    <input
                      className="bg-white/5 text-white"
                      placeholder="Search locations"
                      value={state.locQuery}
                      onChange={(e) => setState((s) => ({ ...s, locQuery: e.target.value }))}
                    />
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {filteredLocs.map((l) => (
                        <Choice key={l.slug} icon={MapPin} compact active={state.locationSlugs.includes(l.slug)} onClick={() => setState((s) => ({ ...s, locationSlugs: toggle(s.locationSlugs, l.slug) as string[] }))}>
                          {l.name}
                        </Choice>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {state.step === 5 && (
                <>
                  <StepHeader icon={StepIcon} step={state.step} title="What's your ideal property range?" description="Set your budget and preferences so we can narrow the results." />
                  <div className="mt-6 grid gap-6">
                    <RangeSection
                      icon={IndianRupee}
                      title="Budget range"
                      minLabel="Minimum budget"
                      maxLabel="Maximum budget"
                      config={budgetConfigs[state.transactionType || "BUY"]}
                      value={getBudgetValues(state)}
                      format={formatBudget}
                      onChange={([min, max]) => setState((s) => ({ ...s, minBudget: String(min), maxBudget: String(max) }))}
                    />
                    {showBhk && (
                      <div>
                        <SectionLabel icon={BedDouble}>BHK</SectionLabel>
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Pill key={n} active={state.bedrooms.includes(n)} onClick={() => setState((s) => ({ ...s, bedrooms: toggle(s.bedrooms, n) as number[] }))}>
                              {n === 5 ? "5+ BHK" : `${n} BHK`}
                            </Pill>
                          ))}
                        </div>
                      </div>
                    )}
                    <RangeSection
                      icon={Ruler}
                      title="Area"
                      minLabel="Minimum area"
                      maxLabel="Maximum area"
                      config={areaConfigs[state.propertyCategory || "RESIDENTIAL"]}
                      value={getAreaValues(state)}
                      format={formatAreaRange}
                      onChange={([min, max]) => setState((s) => ({ ...s, minArea: String(min), maxArea: String(max) }))}
                    />
                    <div>
                      <SectionLabel icon={CalendarClock}>Preferred timeline</SectionLabel>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {timelines.map((t) => (
                          <Pill key={t} active={state.timeline === t} onClick={() => setState((s) => ({ ...s, timeline: t }))}>
                            {t}
                          </Pill>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {state.step === 6 && (
                <>
                  <StepHeader icon={StepIcon} step={state.step} title="Where should we send your matches?" description="Your details also unlock property prices instantly" />
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    {state.propertyTypes.map(typeName).join(", ")} - {state.transactionType} - {state.locationSlugs.map(locName).join(", ")}
                    {state.maxBudget ? ` - up to Rs ${Number(state.maxBudget).toLocaleString("en-IN")}` : ""}
                  </div>
                  <div className="mt-5 grid gap-3">
                    <IconInput icon={UserRound} placeholder="Full name" value={state.name} onChange={(value) => setState((s) => ({ ...s, name: value }))} />
                    <IconInput icon={Phone} placeholder="Phone" value={state.phone} onChange={(value) => setState((s) => ({ ...s, phone: value }))} />
                    <IconInput icon={Mail} placeholder="Email" value={state.email} onChange={(value) => setState((s) => ({ ...s, email: value }))} />
                    <CheckRow checked={state.whatsappSame} onChange={(checked) => setState((s) => ({ ...s, whatsappSame: checked }))}>
                      WhatsApp same as phone
                    </CheckRow>
                    <CheckRow checked={state.consent} onChange={(checked) => setState((s) => ({ ...s, consent: checked }))}>
                      I agree to be contacted about matching properties. Nobody calls until I ask.
                    </CheckRow>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {error && <p className="mt-5 text-center text-sm text-red-300">{error}</p>}

        <div className={cn("mt-7 flex items-center gap-3", state.step === 1 ? "justify-center" : "justify-between")}>
          {state.step > 1 && (
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm text-white/70 transition hover:text-white disabled:opacity-30"
              onClick={() => go(state.step - 1)}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={next}
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ice px-7 text-sm font-semibold text-navy transition hover:-translate-y-0.5 hover:bg-ice-2 active:translate-y-0 disabled:bg-white/15 disabled:text-white/45"
          >
            {state.step === TOTAL_STEPS ? (busy ? "Matching..." : "Show my matches") : "Continue"}
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function StepHeader({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: LucideIcon;
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-[50px] w-[50px] place-items-center rounded-[15px] border border-ice/30 bg-ice/10 text-ice">
        <Icon size={21} />
      </div>
      <p className="mt-5 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-ice">Question {step} of {TOTAL_STEPS}</p>
      <h2 id={step === 1 ? "matcher-title" : undefined} className="display mx-auto mt-3 max-w-[500px] text-[1.55rem] leading-[1.08] text-white sm:text-[2rem]">
        {title}
      </h2>
      <p className="mt-2 text-sm text-white/55">{description}</p>
    </div>
  );
}

function CenteredStep({
  icon,
  step,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <StepHeader icon={icon} step={step} title={title} description={description} />
      {children}
    </div>
  );
}

function CategoryCard({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid min-h-[84px] grid-cols-[38px_1fr] items-center gap-3 rounded-[17px] border px-4 text-left transition duration-200 hover:-translate-y-0.5",
        active ? "scale-[1.01] border-ice bg-ice/12 text-white" : "border-white/12 bg-white/[0.045] text-white/82 hover:border-white/28"
      )}
    >
      <span className={cn("grid h-9 w-9 place-items-center rounded-xl border", active ? "border-ice/45 bg-ice/20 text-ice" : "border-white/12 bg-white/5 text-white/65")}>
        <Icon size={20} />
      </span>
      <span>
        <span className="block text-[0.95rem] font-semibold">{title}</span>
        <span className="mt-1 block text-xs leading-4 text-white/50">{description}</span>
      </span>
    </button>
  );
}

function Choice({
  active,
  onClick,
  children,
  compact,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[16px] border text-left text-sm font-medium transition duration-200 hover:-translate-y-0.5",
        compact ? "min-h-[74px] px-4 py-3" : "min-h-[72px] px-4 py-4",
        active ? "scale-[1.01] border-ice bg-ice/15 text-white" : "border-white/12 bg-white/5 text-white/80 hover:border-white/30"
      )}
    >
      <span className="flex items-center gap-2">
        {Icon && <Icon size={19} className="text-ice/85" />}
        {children}
      </span>
    </button>
  );
}

function IconInput({
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block">
      <Icon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/38" />
      <input className="bg-white/5 pl-11 text-white" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6 text-white/70">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-ice/30 bg-white/[0.03] text-transparent transition peer-checked:border-ice peer-checked:bg-ice peer-checked:text-navy peer-focus-visible:ring-2 peer-focus-visible:ring-ice peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#061827]">
        <Check size={14} />
      </span>
      <span>{children}</span>
    </label>
  );
}

function normalizeSavedState(saved: State): State {
  const propertyCategory =
    saved.propertyCategory ||
    (saved.propertyTypes.some((slug) => ["sco", "shop", "showroom", "office", "commercial-plot"].includes(slug))
      ? "COMMERCIAL"
      : saved.propertyTypes.length
        ? "RESIDENTIAL"
        : "");
  const migratedStep = saved.step >= 5 ? 6 : saved.step === 4 && (saved.minBudget || saved.maxBudget || saved.minArea || saved.maxArea || saved.timeline) ? 5 : saved.step;
  return {
    ...saved,
    propertyCategory,
    step: Math.min(TOTAL_STEPS, Math.max(1, migratedStep || 1)),
    bedrooms: propertyCategory === "RESIDENTIAL" && saved.propertyTypes.some((slug) => bedroomTypes.has(slug)) ? saved.bedrooms : [],
  };
}

function getBudgetValues(state: State): [number, number] {
  const config = budgetConfigs[state.transactionType || "BUY"];
  return [
    clamp(Number(state.minBudget) || config.min, config.min, config.max),
    clamp(Number(state.maxBudget) || config.max, config.min, config.max),
  ];
}

function getAreaValues(state: State): [number, number] {
  const config = areaConfigs[state.propertyCategory || "RESIDENTIAL"];
  return [
    clamp(Number(state.minArea) || config.min, config.min, config.max),
    clamp(Number(state.maxArea) || config.max, config.min, config.max),
  ];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatBudget(amount: number) {
  if (amount >= 10_000_000) {
    const cr = amount / 10_000_000;
    return `Rs ${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
  }
  const lakh = amount / 100_000;
  return `Rs ${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} L`;
}

function formatAreaRange(amount: number) {
  return `${amount.toLocaleString("en-IN")} sq ft`;
}

function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm font-semibold text-white/78">
      <Icon size={17} className="text-ice" />
      {children}
    </p>
  );
}

function RangeSection({
  icon,
  title,
  minLabel,
  maxLabel,
  config,
  value,
  format,
  onChange,
}: {
  icon: LucideIcon;
  title: string;
  minLabel: string;
  maxLabel: string;
  config: { min: number; max: number; step: number };
  value: [number, number];
  format: (value: number) => string;
  onChange: (value: [number, number]) => void;
}) {
  const [minValue, maxValue] = value[0] <= value[1] ? value : [value[1], value[0]];
  const minPercent = ((minValue - config.min) / (config.max - config.min)) * 100;
  const maxPercent = ((maxValue - config.min) / (config.max - config.min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <SectionLabel icon={icon}>{title}</SectionLabel>
        <p className="text-sm font-semibold text-ice">
          {format(minValue)} - {format(maxValue)}
        </p>
      </div>
      <div className="relative mt-5 h-10">
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-ice"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <RangeInput
          ariaLabel={minLabel}
          min={config.min}
          max={config.max}
          step={config.step}
          value={minValue}
          onChange={(next) => onChange([Math.min(next, maxValue), maxValue])}
        />
        <RangeInput
          ariaLabel={maxLabel}
          min={config.min}
          max={config.max}
          step={config.step}
          value={maxValue}
          onChange={(next) => onChange([minValue, Math.max(next, minValue)])}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-white/42">
        <span>{format(config.min)}</span>
        <span>{format(config.max)}</span>
      </div>
    </div>
  );
}

function RangeInput({
  ariaLabel,
  min,
  max,
  step,
  value,
  onChange,
}: {
  ariaLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="range"
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="pointer-events-none absolute inset-x-0 top-0 h-10 min-h-0 appearance-none bg-blue-300 p-0 outline-none focus:shadow-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-navy [&::-moz-range-thumb]:bg-ice [&::-moz-range-thumb]:shadow-none [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-10 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-2.5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-navy [&::-webkit-slider-thumb]:bg-ice [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:hover:scale-110 focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-ice/35"
    />
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border px-4 text-sm font-medium transition hover:-translate-y-0.5",
        active ? "scale-[1.01] border-ice bg-ice/15 text-ice" : "border-white/12 bg-white/5 text-white/72 hover:border-white/30"
      )}
    >
      {children}
    </button>
  );
}
