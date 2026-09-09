"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatArea, formatInr, bhkLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";

export type HeroSlide = {
  slug: string;
  title: string;
  locality: string;
  city: string;
  price: number;
  transactionType: string;
  bedrooms?: number | null;
  area: number;
  tagline?: string | null;
  negotiable?: boolean;
  propertyType?: { name: string };
  images: { url: string }[];
};

export function HeroSlider({
  slides,
  onOpenMatcher,
}: {
  slides: HeroSlide[];
  onOpenMatcher?: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const current = slides[index];

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % Math.max(slides.length, 1));
  }, [slides.length]);
  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % Math.max(slides.length, 1));
  }, [slides.length]);

  useEffect(() => {
    if (paused || reduce || slides.length < 2) return;
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [paused, reduce, next, slides.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (!current) {
    return <div className="h-screen bg-navy" />;
  }

  const cover = current.images[0]?.url;

  return (
    <section
      className="relative h-[100svh] min-h-[640px] overflow-hidden bg-navy text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.slug}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.9 }}
        >
          {cover && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1 }}
              animate={{ scale: reduce ? 1 : 1.06 }}
              transition={{ duration: 5.5, ease: "linear" }}
            >
              <Image
                src={cover}
                alt={current.title}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
              />
            </motion.div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061827] via-[#061827]/45 to-[#061827]/20" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full items-end">
        <div className="container-px w-full pb-16 pt-32 sm:pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug + "-copy"}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <p className="eyebrow text-ice">
                {current.propertyType?.name ?? "Featured"} · {current.city}
              </p>
              <h1 className="display mt-4 text-[clamp(2.4rem,6vw,5.4rem)] text-white">{current.title}</h1>
              <p className="mt-4 text-base text-white/75">
                {current.locality}, {current.city}
                {bhkLabel(current.bedrooms) ? ` · ${bhkLabel(current.bedrooms)}` : ""} · {formatArea(current.area)}
              </p>
              <p className="mt-3 text-2xl font-semibold">
                {formatInr(current.price, current.transactionType)}
                {current.negotiable ? <span className="ml-3 text-sm font-normal text-ice">Negotiable</span> : null}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={`/property/${current.slug}`} variant="ice">
                  View property
                </Button>
                <Button variant="ghost" className="border border-white/20" onClick={onOpenMatcher} type="button">
                  Find a property
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-8 right-6 z-10 hidden items-center gap-3 sm:flex">
        <button aria-label="Previous" onClick={prev} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10">
          <ChevronLeft size={18} />
        </button>
        <button aria-label="Next" onClick={next} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:left-auto sm:right-32 sm:translate-x-0">
        {slides.map((s, i) => (
          <button
            key={s.slug}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-10 bg-ice" : "w-5 bg-white/35"}`}
          />
        ))}
      </div>
    </section>
  );
}
