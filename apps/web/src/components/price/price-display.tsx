"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, Check, LoaderCircle, Lock, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

const phoneRegex = /^(?:\+91[\s-]?|91[\s-]?|0)?[6-9]\d{9}$/;

const schema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid Indian mobile number"),
  email: z.string().trim().email("Enter a valid email address"),
  whatsappSame: z.boolean(),
  consent: z.boolean().refine((value) => value === true, "Please agree to be contacted for price access."),
});

type FormValues = z.infer<typeof schema>;

type PriceContext = {
  propertyId?: string;
  propertySlug?: string;
  propertyTitle?: string;
};

export function PriceDisplay({
  price,
  transactionType,
  priceLocked,
  property,
  className,
  buttonClassName,
  buttonLabel = "View Price",
  showButton = true,
  dark = false,
}: {
  price: number | null;
  transactionType?: string;
  priceLocked?: boolean;
  property?: PriceContext;
  className?: string;
  buttonClassName?: string;
  buttonLabel?: string;
  showButton?: boolean;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!priceLocked && typeof price === "number") {
    return <span className={className}>{formatInr(price, transactionType)}</span>;
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-3", className)}>
      <span>Price on Request</span>
      {showButton && (
        <PriceUnlockButton
          className={buttonClassName}
          label={buttonLabel}
          dark={dark}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            window.dispatchEvent(new CustomEvent("tn:analytics", { detail: { event: "PRICE_UNLOCK_OPENED" } }));
            setOpen(true);
          }}
        />
      )}
      {open && <PriceUnlockModal property={property} onClose={() => setOpen(false)} dark={dark} />}
    </span>
  );
}

export function PriceUnlockButton({
  onClick,
  className,
  label = "View Price",
  dark = false,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  label?: string;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition",
        dark ? "bg-ice text-navy hover:bg-ice-2" : "bg-navy text-white hover:bg-navy-2",
        className
      )}
    >
      <Lock size={16} />
      {label}
    </button>
  );
}

export function PriceUnlockModal({
  property,
  onClose,
  dark = false,
}: {
  property?: PriceContext;
  onClose: () => void;
  dark?: boolean;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: "", phone: "", email: "", whatsappSame: true, consent: true },
  });

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onSubmit(values: FormValues) {
    setServerError("");
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setServerError(parsed.error.issues[0]?.message ?? "Please complete the form.");
      return;
    }

    window.dispatchEvent(new CustomEvent("tn:analytics", { detail: { event: "PRICE_UNLOCK_SUBMITTED" } }));
    const res = await fetch("/api/price-unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        whatsapp: parsed.data.whatsappSame ? parsed.data.phone : undefined,
        consent: parsed.data.consent,
        ...property,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setServerError(data?.error || "Could not unlock prices. Please try again.");
      return;
    }

    window.dispatchEvent(new CustomEvent("tn:analytics", { detail: { event: "PRICE_UNLOCK_SUCCESS" } }));
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-unlock-title"
      aria-describedby="price-unlock-description"
    >
      <motion.button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-[rgba(16,37,31,0.76)] backdrop-blur-[12px]"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduce ? undefined : { opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative z-10 max-h-[calc(100svh-32px)] w-full max-w-[560px] overflow-y-auto rounded-[28px] border border-ice/15 bg-navy px-5 py-6 text-white shadow-[0_28px_90px_rgba(0,0,0,0.36)] sm:px-9 sm:py-8",
          dark && "bg-navy"
        )}
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-ice/35" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-20 w-64 -translate-x-1/2 rounded-full bg-ice/10 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-ice/75">Price access</p>
            <h2 id="price-unlock-title" className="display mt-3 text-[1.75rem] leading-[1.02] text-white sm:text-[2.15rem]">
              Unlock Property Prices
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.03] text-white/78 transition hover:border-ice/30 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <p id="price-unlock-description" className="relative mt-4 max-w-[28rem] text-[0.95rem] leading-6 text-white/72">
          Share your details once to unlock property prices across tricityinvestment.
          <span className="block text-white/55">Our property team may also contact you to assist with your search.</span>
        </p>

        <div className="relative mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-white/55">
          {["One-time verification", "Prices unlock instantly", "No repeated forms"].map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <Check size={13} className="text-ice" />
              {item}
            </span>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="relative mt-7 grid gap-[17px]">
          <Field label="Full name" error={errors.name?.message || (serverError.includes("name") ? serverError : "")}>
            <input
              className="h-14 rounded-[15px] border-white/0 bg-page px-4 text-[0.95rem] text-navy placeholder:text-ink-soft focus:border-ice focus:ring-4 focus:ring-ice/25"
              placeholder="Enter your full name"
              {...register("name", { required: "Full name is required" })}
            />
          </Field>
          <Field label="Phone number" error={errors.phone?.message}>
            <div className="flex h-14 items-center rounded-[15px] border border-white/0 bg-page text-navy focus-within:border-ice focus-within:ring-4 focus-within:ring-ice/25">
              <span className="grid h-full place-items-center border-r border-line/80 px-4 text-sm font-semibold text-navy/70">+91</span>
              <input
                inputMode="tel"
                className="h-full min-h-0 border-0 bg-transparent px-4 text-[0.95rem] placeholder:text-ink-soft focus:shadow-none focus:ring-0"
                placeholder="98765 43210"
                {...register("phone", { required: "Phone number is required" })}
              />
            </div>
          </Field>
          <Field label="Email address" error={errors.email?.message}>
            <input
              type="email"
              className="h-14 rounded-[15px] border-white/0 bg-page px-4 text-[0.95rem] text-navy placeholder:text-ink-soft focus:border-ice focus:ring-4 focus:ring-ice/25"
              placeholder="name@example.com"
              {...register("email", { required: "Email address is required" })}
            />
          </Field>
          <div className="grid gap-3 pt-1">
            <CustomCheckbox
              label="WhatsApp number is the same as phone"
              registration={register("whatsappSame")}
            />
            <CustomCheckbox
              label="I agree to be contacted regarding property prices and assistance."
              registration={register("consent", { validate: (value) => value === true || "Please agree to be contacted for price access." })}
            />
          </div>
          <p className="text-xs leading-5 text-white/45">
            Your details are used only for property assistance and price access.{" "}
            <a href="/privacy" className="text-ice/80 underline-offset-4 hover:text-ice hover:underline">
              Privacy Policy
            </a>
          </p>
          {serverError && <p className="rounded-[14px] border border-red-300/15 bg-red-400/10 px-3 py-2 text-sm text-red-200">{serverError}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ice px-6 text-sm font-semibold text-navy transition duration-200 hover:-translate-y-0.5 hover:bg-ice-2 active:translate-y-0 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Unlocking prices...
              </>
            ) : (
              <>
                Unlock Prices
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.84rem] font-medium text-white/70">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-200">{error}</span> : null}
    </label>
  );
}

function CustomCheckbox({ label, registration }: { label: string; registration: UseFormRegisterReturn }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6 text-white/68">
      <input type="checkbox" className="peer sr-only" {...registration} />
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-ice/30 bg-white/[0.03] text-transparent transition duration-200 peer-checked:border-ice peer-checked:bg-ice peer-checked:text-navy peer-focus-visible:ring-2 peer-focus-visible:ring-ice peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-navy">
        <Check size={14} />
      </span>
      <span>{label}</span>
    </label>
  );
}
