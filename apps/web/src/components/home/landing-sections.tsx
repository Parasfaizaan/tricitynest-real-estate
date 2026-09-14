"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { PropertyCard, type CardProperty } from "@/components/property/card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { motionDurations, motionEase } from "@/components/motion/variants";

export function TrustMetrics({ count }: { count: number }) {
  const stats = [
    { label: "Happy clients", value: 2000, suffix: "+" },
    { label: "Active investors", value: 500, suffix: "+" },
    { label: "Rating", value: 4.7, suffix: "", decimals: 1 },
    { label: "Verified properties", value: count, suffix: "+" },
  ];
  return (
    <section className="bg-navy text-white">
      <Stagger className="container-px grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <p className="display text-4xl text-ice md:text-5xl">
              <Counter value={s.value} decimals={s.decimals} />
              {s.suffix}
            </p>
            <p className="mt-2 text-sm text-white/60">{s.label}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [n, setN] = useState(() => (reduce ? value : 0));
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1000);
        setN(value * p);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.disconnect();
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, value]);
  return <span ref={ref}>{decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString("en-IN")}</span>;
}

export function FeaturedRow({ properties }: { properties: CardProperty[] }) {
  return (
    <section className="section-pad">
      <div className="container-px">
        <Reveal>
          <p className="eyebrow">The collection</p>
          <h2 className="display mt-3 text-[clamp(2rem,4vw,3.4rem)] text-navy">Properties worth seeing</h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <StaggerItem key={p.slug}>
              <PropertyCard property={p} />
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-10" delay={0.1}>
          <Button href="/properties" variant="outline">
            Browse all properties
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export function WhyUs() {
  const items = [
    { n: "01", t: "Verified listings", d: "Every home is checked for price, photos and availability before it reaches you." },
    { n: "02", t: "Selective properties", d: "We keep a short, honest catalogue rather than flooding you with every listing in Tricity." },
    { n: "03", t: "Personalised recommendations", d: "Six questions. A shortlist that actually fits configuration, location and timeline." },
    { n: "04", t: "Trusted advisory", d: "Site visits, paperwork and negotiation - with a human who knows the corridor." },
  ];
  return (
    <section className="section-pad bg-white">
      <div className="container-px">
        <Reveal>
          <p className="eyebrow">Why tricityinvestment</p>
          <h2 className="display mt-3 max-w-xl text-[clamp(2rem,4vw,3.2rem)] text-navy">Advice first. Inventory second.</h2>
        </Reveal>
        <Stagger className="mt-12 grid gap-px overflow-hidden rounded-[24px] border border-line bg-line md:grid-cols-2">
          {items.map((it) => (
            <StaggerItem key={it.n} className="bg-white p-8 md:p-10">
              <p className="display text-3xl text-ice">{it.n}</p>
              <h3 className="mt-4 text-xl font-semibold text-navy">{it.t}</h3>
              <p className="mt-3 max-w-md text-ink-soft">{it.d}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function LocationsGrid({
  locations,
}: {
  locations: { name: string; slug: string; imageUrl: string | null; _count?: { properties: number } }[];
}) {
  const imageFor = (location: { slug: string; imageUrl: string | null }) =>
    location.slug === "derabassi"
      ? "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
      : location.imageUrl;

  return (
    <section className="section-pad">
      <div className="container-px">
        <Reveal>
          <p className="eyebrow">Corridor</p>
          <h2 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)] text-navy">Locations we serve</h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((l) => (
            <StaggerItem key={l.slug}>
              <Link href={`/properties/${l.slug}`} className="group relative block aspect-[5/4] overflow-hidden rounded-[22px]">
                {imageFor(l) && (
                  <Image src={imageFor(l) || ""} alt={l.name} fill className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent transition duration-500 group-hover:via-navy/30" />
                <div className="absolute bottom-5 left-5 text-white">
                  <p className="display text-2xl">{l.name}</p>
                  <p className="text-sm text-white/70">{l._count?.properties ?? 0} listings</p>
                </div>
                <ArrowUpRight className="absolute right-5 top-5 text-white/70 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ice" size={18} />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function Testimonials() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const quotes = [
    { q: "We saw three homes, not thirty. Closed on a Sector 70 floor in two weeks.", n: "Ananya & Kabir", c: "Mohali" },
    { q: "Clear prices, real photos, and someone who actually picked up the phone.", n: "Harpreet S.", c: "Zirakpur" },
    { q: "The matcher saved a weekend of scrolling. The villa shortlist was exact.", n: "Meera V.", c: "New Chandigarh" },
  ];

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % quotes.length), 7000);
    return () => window.clearInterval(timer);
  }, [quotes.length, reduce]);

  return (
    <section className="section-pad bg-navy text-white">
      <div className="container-px">
        <Reveal>
          <p className="eyebrow text-ice">Kind words</p>
          <h2 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)]">People who found their nest</h2>
        </Reveal>
        <Stagger className="mt-10 hidden gap-6 md:grid md:grid-cols-3">
          {quotes.map((q) => (
            <StaggerItem key={q.n}>
            <blockquote className="rounded-[22px] border border-white/10 bg-white/5 p-7 transition duration-300 hover:-translate-y-0.5 hover:border-ice/25">
              <p className="text-lg leading-relaxed text-white/85">&quot;{q.q}&quot;</p>
              <footer className="mt-6 text-sm text-ice">
                {q.n} - {q.c}
              </footer>
            </blockquote>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-10 overflow-hidden md:hidden">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={quotes[index].n}
              initial={reduce ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -18 }}
              transition={{ duration: motionDurations.card, ease: motionEase }}
              className="rounded-[22px] border border-white/10 bg-white/5 p-7"
            >
              <p className="text-lg leading-relaxed text-white/85">&quot;{quotes[index].q}&quot;</p>
              <footer className="mt-6 text-sm text-ice">
                {quotes[index].n} - {quotes[index].c}
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export function AboutTeaser() {
  return (
    <section className="section-pad">
      <div className="container-px grid items-center gap-10 md:grid-cols-2">
        <Reveal>
          <p className="eyebrow">The studio</p>
          <h2 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)] text-navy">A quieter way to buy in Tricity</h2>
          <p className="mt-5 max-w-md text-ink-soft leading-relaxed">
            tricityinvestment is an independent advisory for the Chandigarh corridor. We list fewer properties, photograph them properly, and never invent a price.
          </p>
          <Button href="/about" variant="outline" className="mt-8">
            About us
          </Button>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
              alt="Interior of a Tricity home"
              fill
              className="object-cover transition duration-700 hover:scale-[1.035]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function ConsultationForm() {
  const [status, setStatus] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        topic: "consultation",
        message: fd.get("message") || "Please call me about a property consultation.",
      }),
    });
    setStatus(res.ok ? "We will call you shortly. Property prices are now unlocked." : "Could not send. Try again.");
    if (res.ok) {
      e.currentTarget.reset();
      window.location.reload();
    }
  }
  return (
    <section className="section-pad bg-white" id="consultation">
      <div className="container-px grid gap-10 md:grid-cols-2">
        <Reveal>
          <p className="eyebrow">Private consultation</p>
          <h2 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)] text-navy">Talk to a property expert</h2>
          <p className="mt-4 max-w-md text-ink-soft">Share a number. We will prepare a shortlist before we call - not a spray of listings.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="grid gap-3">
            <input name="name" required placeholder="Name" />
            <input name="phone" required placeholder="Phone" />
            <input name="email" type="email" required placeholder="Email" />
            <textarea name="message" rows={4} placeholder="What are you looking for?" />
            <Button type="submit">Request a call</Button>
            {status && <p className="text-sm text-ink-soft">{status}</p>}
          </form>
        </Reveal>
      </div>
    </section>
  );
}

export function Newsletter() {
  const [status, setStatus] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email") }),
    });
    setStatus(res.ok ? "You're on the list." : "Could not subscribe.");
    if (res.ok) e.currentTarget.reset();
  }
  return (
    <section className="border-t border-line bg-page py-16">
      <Reveal className="container-px flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <p className="eyebrow">Alerts</p>
          <h2 className="display mt-2 text-3xl text-navy">New property alerts</h2>
        </div>
        <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
          <input name="email" type="email" required placeholder="Email address" />
          <Button type="submit" className="shrink-0">
            Subscribe
          </Button>
        </form>
      </Reveal>
      {status && <p className="container-px mt-3 text-sm text-ink-soft">{status}</p>}
    </section>
  );
}
