"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  Home,
  IndianRupee,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Search,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tax = {
  locations: { name: string; slug: string }[];
  propertyTypes: { name: string; slug: string; category: string }[];
};

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
  sizeUnit: "any" | "sqft" | "sqyd" | "sqm";
  timeline: string;
  name: string;
  phone: string;
  email: string;
  whatsappSame: boolean;
  consent: boolean;
};

const STORAGE_KEY = "tn_matcher_state";
const CLOSED_KEY = "tn_matcher_closed";
const TOTAL_STEPS = 3;
const phoneRegex = /^(?:\+91[\s-]?|91[\s-]?|0)?[6-9]\d{9}$/;

const empty: State = {
  step: 1,
  propertyCategory: "",
  propertyTypes: [],
  transactionType: "",
  locationSlugs: [],
  locQuery: "",
  minBudget: "1000000",
  maxBudget: "100000000",
  bedrooms: [],
  sizeUnit: "any",
  timeline: "Immediately",
  name: "",
  phone: "",
  email: "",
  whatsappSame: true,
  consent: false,
};

const steps = ["Property Details", "Location & Preferences", "Your Details"];
const timelines = ["Immediately", "Within 1 month", "1-3 months", "Later"];
const budgetConfig = { min: 1_000_000, max: 100_000_000, step: 500_000 };

const sidePanels = [
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
    title: "Every\nproperty tells\na new story.",
    copy: "Tell us what you're looking for and we'll find the right matches for you.",
  },
  {
    image: "https://images.pexels.com/photos/7412069/pexels-photo-7412069.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Find the\nright location,\nfor a brighter\ntomorrow.",
    copy: "Choose your preferred location and set your preferences to see the most relevant properties.",
  },
  {
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85",
    title: "Almost there!",
    copy: "Share a few details and we'll show you the best matching properties.",
  },
];

const typeImages: Record<string, string> = {
  apartment: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80",
  "builder-floor": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=80",
  villa: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=500&q=80",
  plot: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80",
  "commercial-plot": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80",
  office: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=500&q=80",
  showroom: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80",
  shop: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=500&q=80",
  sco: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=500&q=80",
};

const locationImages: Record<string, string> = {
  mohali: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
  chandigarh: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=400&q=80",
  zirakpur: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=400&q=80",
  kharar: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
  "new-chandigarh": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=400&q=80",
  derabassi: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
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
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const availableTypes = useMemo(
    () => taxonomies.propertyTypes.filter((type) => type.category === (state.propertyCategory || "RESIDENTIAL")).slice(0, 4),
    [state.propertyCategory, taxonomies.propertyTypes]
  );

  const filteredLocations = useMemo(() => {
    const query = state.locQuery.toLowerCase();
    return taxonomies.locations.filter((location) => location.name.toLowerCase().includes(query)).slice(0, 6);
  }, [state.locQuery, taxonomies.locations]);

  function handleClose() {
    try {
      sessionStorage.setItem(CLOSED_KEY, "1");
    } catch {}
    onClose();
  }

  function setStep(step: number) {
    setError("");
    setDir(step > state.step ? 1 : -1);
    setState((current) => ({ ...current, step }));
  }

  function chooseCategory(propertyCategory: State["propertyCategory"]) {
    setError("");
    setState((current) => ({
      ...current,
      propertyCategory,
      propertyTypes: current.propertyCategory === propertyCategory ? current.propertyTypes : [],
      bedrooms: propertyCategory === "RESIDENTIAL" ? current.bedrooms : [],
    }));
  }

  function chooseType(slug: string) {
    setState((current) => ({ ...current, propertyTypes: [slug] }));
  }

  function chooseTransaction(transactionType: State["transactionType"]) {
    setState((current) => ({
      ...current,
      transactionType,
      minBudget: transactionType === "RENT" ? "10000" : "1000000",
      maxBudget: transactionType === "RENT" ? "500000" : "100000000",
    }));
  }

  function validate() {
    if (state.step === 1) {
      if (!state.propertyCategory) return "Select a property category.";
      if (state.propertyTypes.length === 0) return "Select a property type.";
      if (!state.transactionType) return "Choose buy, rent or invest.";
    }
    if (state.step === 2) {
      if (state.locationSlugs.length === 0) return "Select at least one location.";
      if (Number(state.minBudget) > Number(state.maxBudget)) return "Minimum budget cannot exceed maximum budget.";
    }
    if (state.step === 3) {
      if (state.name.trim().length < 2) return "Enter your full name.";
      if (!phoneRegex.test(state.phone.trim())) return "Enter a valid Indian mobile number.";
      if (!state.email.includes("@")) return "Enter a valid email.";
      if (!state.consent) return "Consent is required.";
    }
    return "";
  }

  async function next() {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    if (state.step < TOTAL_STEPS) {
      setStep(state.step + 1);
      return;
    }

    setBusy(true);
    setError("");
    const response = await fetch("/api/matcher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyTypes: state.propertyTypes,
        transactionType: state.transactionType,
        locationSlugs: state.locationSlugs,
        minBudget: state.minBudget ? Number(state.minBudget) : null,
        maxBudget: state.maxBudget ? Number(state.maxBudget) : null,
        bedrooms: state.bedrooms,
        minArea: null,
        maxArea: null,
        timeline: state.timeline,
        name: state.name,
        phone: state.phone,
        email: state.email,
        whatsapp: state.whatsappSame ? state.phone : undefined,
        consent: state.consent,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
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

  const panel = sidePanels[state.step - 1];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/70 p-2 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="matcher-title">
      <motion.button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 grid max-h-[calc(100dvh-14px)] w-[min(1180px,calc(100vw-12px))] overflow-hidden rounded-[18px] border border-navy/20 bg-white text-navy shadow-[0_30px_90px_rgba(0,0,0,0.38)] md:grid-cols-[380px_1fr]"
      >
        <aside className="relative hidden min-h-[680px] overflow-hidden md:block">
          <Image src={panel.image} alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-transparent" />
          <div className="absolute bottom-10 left-9 right-9 text-white">
            <div className="mb-6 h-1 w-16 rounded-full bg-ice" />
            <p className="display whitespace-pre-line text-[2.15rem] leading-[0.98]">{panel.title}</p>
            <p className="mt-7 max-w-[250px] text-sm leading-6 text-white/82">{panel.copy}</p>
          </div>
        </aside>

        <section className="relative max-h-[calc(100dvh-14px)] overflow-y-auto px-5 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-8 md:px-12 md:py-7">
          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-navy/65 transition hover:bg-page hover:text-navy"
            aria-label="Close questionnaire"
          >
            <X size={21} />
          </button>

          <Stepper step={state.step} />

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={state.step}
              custom={dir}
              initial={reduce ? false : { opacity: 0, x: dir > 0 ? 18 : -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: dir > 0 ? -18 : 18 }}
              transition={{ duration: 0.2 }}
              className="mt-8"
            >
              {state.step === 1 && (
                <StepOne
                  state={state}
                  types={availableTypes}
                  onCategory={chooseCategory}
                  onType={chooseType}
                  onTransaction={chooseTransaction}
                />
              )}
              {state.step === 2 && (
                <StepTwo
                  state={state}
                  locations={filteredLocations}
                  onChange={(patch) => setState((current) => ({ ...current, ...patch }))}
                />
              )}
              {state.step === 3 && (
                <StepThree
                  state={state}
                  onChange={(patch) => setState((current) => ({ ...current, ...patch }))}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

          <div className="mt-8 flex items-center justify-between">
            {state.step > 1 ? (
              <button type="button" onClick={() => setStep(state.step - 1)} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy/75 transition hover:text-navy">
                <ArrowLeft size={16} />
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={next}
              disabled={busy}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-navy px-8 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-navy-2 disabled:bg-navy/35"
            >
              {state.step === TOTAL_STEPS ? (busy ? "Finding..." : "Find My Matches") : "Next"}
              <ArrowRight size={17} />
            </button>
          </div>
        </section>
      </motion.div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center pr-10 text-[11px] font-semibold text-ink-soft">
      {steps.map((label, index) => {
        const number = index + 1;
        const active = number === step;
        const complete = number < step;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs", active ? "border-navy bg-navy text-white" : complete ? "border-navy/35 bg-white text-navy" : "border-line bg-white text-ink-soft/60")}>
              {complete ? <Check size={15} /> : String(number).padStart(2, "0")}
            </div>
            <span className={cn("ml-2 hidden sm:inline", active ? "text-navy" : "text-ink-soft/60")}>{label}</span>
            {number < TOTAL_STEPS && <span className="mx-3 h-px flex-1 bg-line" />}
          </div>
        );
      })}
    </div>
  );
}

function StepOne({
  state,
  types,
  onCategory,
  onType,
  onTransaction,
}: {
  state: State;
  types: { name: string; slug: string; category: string }[];
  onCategory: (value: State["propertyCategory"]) => void;
  onType: (value: string) => void;
  onTransaction: (value: State["transactionType"]) => void;
}) {
  return (
    <>
      <Heading title="What type of property are you looking for?" description="Select the property category and type that fits your needs." />
      <FieldTitle>Property Category</FieldTitle>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <CategoryCard icon={Home} title="Residential" description="Homes, apartments, villas and more" active={state.propertyCategory === "RESIDENTIAL"} onClick={() => onCategory("RESIDENTIAL")} />
        <CategoryCard icon={Building2} title="Commercial" description="Offices, showrooms, shops and more" active={state.propertyCategory === "COMMERCIAL"} onClick={() => onCategory("COMMERCIAL")} />
      </div>

      <FieldTitle className="mt-6">Property Type</FieldTitle>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {types.map((type) => (
          <ImageOption
            key={type.slug}
            title={type.name}
            image={typeImages[type.slug] ?? typeImages.apartment}
            active={state.propertyTypes.includes(type.slug)}
            onClick={() => onType(type.slug)}
          />
        ))}
      </div>

      <FieldTitle className="mt-6">Purpose</FieldTitle>
      <Segmented
        value={state.transactionType}
        options={[
          ["BUY", "Buy"],
          ["RENT", "Rent"],
          ["INVEST", "Invest"],
        ]}
        onChange={(value) => onTransaction(value as State["transactionType"])}
      />
    </>
  );
}

function StepTwo({
  state,
  locations,
  onChange,
}: {
  state: State;
  locations: { name: string; slug: string }[];
  onChange: (patch: Partial<State>) => void;
}) {
  const budget = getBudgetValues(state);
  return (
    <>
      <Heading title="Where would you like to look?" description="Search for a city, area or locality" />
      <label className="relative mt-5 block">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" size={18} />
        <input value={state.locQuery} onChange={(event) => onChange({ locQuery: event.target.value })} placeholder="Search location (e.g. Chandigarh, Mohali)" className="rounded-xl !pl-12" />
      </label>

      <FieldTitle className="mt-6">Popular Locations</FieldTitle>
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {locations.map((location) => (
          <LocationOption
            key={location.slug}
            location={location}
            active={state.locationSlugs.includes(location.slug)}
            onClick={() => onChange({ locationSlugs: toggle(state.locationSlugs, location.slug) })}
          />
        ))}
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-2">
        <div>
          <SectionLabel icon={IndianRupee}>Budget Range</SectionLabel>
          <DualRange value={budget} onChange={([minBudget, maxBudget]) => onChange({ minBudget: String(minBudget), maxBudget: String(maxBudget) })} />
        </div>
        <div>
          <SectionLabel icon={Ruler}>Property Size <span className="font-normal text-ink-soft">(Optional)</span></SectionLabel>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              ["any", "Any"],
              ["sqft", "Sq. Ft."],
              ["sqyd", "Sq. Yd."],
              ["sqm", "Sq. M."],
            ].map(([value, label]) => (
              <SmallPill key={value} active={state.sizeUnit === value} onClick={() => onChange({ sizeUnit: value as State["sizeUnit"] })}>{label}</SmallPill>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel icon={Home}>BHK <span className="font-normal text-ink-soft">(Optional)</span></SectionLabel>
          <div className="mt-3 grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <SmallPill key={n} active={n === 0 ? state.bedrooms.length === 0 : state.bedrooms.includes(n)} onClick={() => onChange({ bedrooms: n === 0 ? [] : toggle(state.bedrooms, n) })}>
                {n === 0 ? "Any" : n === 5 ? "5+" : n}
              </SmallPill>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel icon={CalendarDays}>Preferred Timeline <span className="font-normal text-ink-soft">(Optional)</span></SectionLabel>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {timelines.map((timeline) => (
              <SmallPill key={timeline} active={state.timeline === timeline} onClick={() => onChange({ timeline })}>{timeline}</SmallPill>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StepThree({ state, onChange }: { state: State; onChange: (patch: Partial<State>) => void }) {
  return (
    <>
      <Heading title="Tell us about yourself" description="Get personalized matches and expert assistance." />
      <div className="mt-6 grid gap-4">
        <TextInput label="Full Name" required icon={UserRound} value={state.name} placeholder="John Doe" onChange={(name) => onChange({ name })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Phone Number" required icon={Phone} value={state.phone} placeholder="98765 43210" prefix="+91" onChange={(phone) => onChange({ phone })} />
          <TextInput label="Email Address" required icon={Mail} value={state.email} placeholder="you@example.com" onChange={(email) => onChange({ email })} />
        </div>
        <CheckRow checked={state.whatsappSame} onChange={(whatsappSame) => onChange({ whatsappSame })}>
          Send updates on WhatsApp (same as phone number)
        </CheckRow>
        <CheckRow checked={state.consent} onChange={(consent) => onChange({ consent })}>
          I agree to be contacted about matching properties. Nobody calls until I ask.
        </CheckRow>
      </div>
    </>
  );
}

function Heading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 id="matcher-title" className="display max-w-[520px] text-[clamp(1.9rem,3vw,2.65rem)] leading-[1.02] text-navy">{title}</h2>
      <p className="mt-2 text-sm text-ink-soft">{description}</p>
    </div>
  );
}

function FieldTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm font-bold text-navy", className)}>{children}</p>;
}

function CategoryCard({ icon: Icon, title, description, active, onClick }: { icon: LucideIcon; title: string; description: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("relative flex min-h-[126px] items-center gap-4 rounded-xl border p-5 text-left transition hover:-translate-y-0.5", active ? "border-navy/25 bg-navy/5 shadow-[0_0_0_2px_rgba(16,37,31,0.08)]" : "border-line bg-white hover:border-navy/20")}>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-navy">
        <Icon size={38} strokeWidth={1.6} />
      </span>
      <span>
        <span className="block text-lg font-bold">{title}</span>
        <span className="mt-1 block text-xs leading-4 text-ink-soft">{description}</span>
      </span>
      {active && <span className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-navy text-white"><Check size={16} /></span>}
    </button>
  );
}

function ImageOption({ title, image, active, onClick }: { title: string; image: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <span className={cn("relative block aspect-[4/3] overflow-hidden rounded-xl border bg-page transition", active ? "border-navy shadow-[0_0_0_3px_rgba(16,37,31,0.14)]" : "border-line")}>
        <Image src={image} alt="" fill className="object-cover" />
        {active && <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-navy text-white"><Check size={16} /></span>}
      </span>
      <span className="mt-2 block text-sm font-bold text-navy">{title}</span>
    </button>
  );
}

function LocationOption({ location, active, onClick }: { location: { name: string; slug: string }; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <span className={cn("relative block aspect-square overflow-hidden rounded-lg border bg-page transition", active ? "border-navy shadow-[0_0_0_2px_rgba(16,37,31,0.14)]" : "border-line")}>
        <Image src={locationImages[location.slug] ?? typeImages.apartment} alt="" fill className="object-cover" />
        {active && <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-navy text-white"><Check size={14} /></span>}
      </span>
      <span className="mt-2 block truncate text-xs font-bold text-navy">{location.name}</span>
    </button>
  );
}

function Segmented({ value, options, onChange }: { value: string; options: [string, string][]; onChange: (value: string) => void }) {
  return (
    <div className="mt-3 grid gap-4 sm:grid-cols-3">
      {options.map(([optionValue, label]) => (
        <button key={optionValue} type="button" onClick={() => onChange(optionValue)} className={cn("min-h-12 rounded-xl border text-sm font-bold transition hover:-translate-y-0.5", value === optionValue ? "border-navy bg-navy text-white" : "border-line bg-white text-navy")}>
          {label}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return <p className="flex items-center gap-2 text-sm font-bold text-navy"><Icon size={17} />{children}</p>;
}

function SmallPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("min-h-10 rounded-lg border px-2 text-xs font-bold transition", active ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy/25")}>
      {children}
    </button>
  );
}

function DualRange({ value, onChange }: { value: [number, number]; onChange: (value: [number, number]) => void }) {
  const [minValue, maxValue] = value[0] <= value[1] ? value : [value[1], value[0]];
  const minPercent = ((minValue - budgetConfig.min) / (budgetConfig.max - budgetConfig.min)) * 100;
  const maxPercent = ((maxValue - budgetConfig.min) / (budgetConfig.max - budgetConfig.min)) * 100;
  return (
    <div className="mt-4">
      <div className="relative h-9">
        <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-line" />
        <div className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-navy" style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }} />
        <RangeInput value={minValue} onChange={(next) => onChange([Math.min(next, maxValue), maxValue])} />
        <RangeInput value={maxValue} onChange={(next) => onChange([minValue, Math.max(next, minValue)])} />
      </div>
      <div className="mt-2 flex justify-between text-xs font-semibold text-navy">
        <span>{formatBudget(minValue)}</span>
        <span>{formatBudget(maxValue)}</span>
      </div>
    </div>
  );
}

function RangeInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <input
      type="range"
      min={budgetConfig.min}
      max={budgetConfig.max}
      step={budgetConfig.step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="pointer-events-none absolute inset-x-0 top-0 h-9 !min-h-0 appearance-none !border-0 !bg-transparent !p-0 outline-none focus:shadow-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-navy [&::-moz-range-thumb]:shadow-none [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:h-9 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-2 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-navy"
    />
  );
}

function TextInput({ label, required, icon: Icon, value, placeholder, prefix, onChange }: { label: string; required?: boolean; icon: LucideIcon; value: string; placeholder: string; prefix?: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-navy">{label} {required && <span className="text-red-600">*</span>}</span>
      <span className="relative mt-2 flex items-center">
        <Icon size={18} className="absolute left-4 text-ink-soft" />
        {prefix && <span className="absolute left-11 text-sm font-semibold text-navy">{prefix}</span>}
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={cn("rounded-xl", prefix ? "!pl-20" : "!pl-12")} />
      </span>
    </label>
  );
}

function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (checked: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border border-line bg-white text-transparent transition peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white">
        <Check size={14} />
      </span>
      <span>{children}</span>
    </label>
  );
}

function normalizeSavedState(saved: State): State {
  const propertyCategory =
    saved.propertyCategory ||
    (saved.propertyTypes.some((slug) => ["sco", "shop", "showroom", "office", "commercial-plot"].includes(slug)) ? "COMMERCIAL" : saved.propertyTypes.length ? "RESIDENTIAL" : "");
  return {
    ...saved,
    propertyCategory,
    step: Math.min(TOTAL_STEPS, Math.max(1, Number(saved.step) || 1)),
  };
}

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function getBudgetValues(state: State): [number, number] {
  return [
    clamp(Number(state.minBudget) || budgetConfig.min, budgetConfig.min, budgetConfig.max),
    clamp(Number(state.maxBudget) || budgetConfig.max, budgetConfig.min, budgetConfig.max),
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
