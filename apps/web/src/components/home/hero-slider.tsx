"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatArea, bhkLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/price/price-display";
import { motionDurations, motionEase, staggerContainer, staggerItem } from "@/components/motion/variants";

export type HeroSlide = {
  slug: string;
  title: string;
  locality: string;
  city: string;
  price: number | null;
  priceLocked?: boolean;
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
  const [imageIndex, setImageIndex] = useState(0);
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
    const t = setInterval(next, 5800);
    return () => clearInterval(t);
  }, [paused, reduce, next, slides.length]);

  useEffect(() => {
    setImageIndex(0);
  }, [current?.slug]);

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

  const cover = current.images[imageIndex]?.url ?? current.images[0]?.url;
  const previewImages = current.images.length > 1
    ? current.images.slice(0, 4)
    : slides.map((slide) => slide.images[0]).filter(Boolean).slice(0, 4);

  return (
    <section
      className="relative h-[100svh] min-h-[640px] overflow-hidden bg-navy text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <AnimatePresence mode="wait">
        <motion.div
            key={`${current.slug}-${cover}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : motionDurations.heroSlide, ease: motionEase }}
        >
          {cover && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: reduce ? 1 : 1.015 }}
              animate={{ scale: reduce ? 1 : 1.045 }}
              transition={{ duration: motionDurations.kenBurns, ease: "linear" }}
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
          <div className="absolute inset-0 bg-gradient-to-r from-navy/92 via-navy/46 to-navy/16" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/78 via-transparent to-navy/22" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full items-center">
        <div className="container-px w-full pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug + "-copy"}
              initial={reduce ? false : "hidden"}
              animate="show"
              exit={reduce ? undefined : { opacity: 0, y: -10, transition: { duration: 0.22, ease: motionEase } }}
              variants={reduce ? undefined : staggerContainer}
              className="max-w-3xl lg:max-w-[680px]"
            >
              <motion.p variants={staggerItem} className="text-xs font-semibold uppercase tracking-[0.22em] text-ice">
                {current.propertyType?.name ?? "Featured"} - {current.city}
              </motion.p>
              <motion.h1 variants={staggerItem} className="mt-4 max-w-[11ch] text-[clamp(3rem,6.8vw,6.9rem)] font-black leading-[0.92] tracking-[-0.04em] text-white">
                {current.title}
              </motion.h1>
              <motion.p variants={staggerItem} className="mt-5 text-base font-medium text-white/82">
                {current.locality}, {current.city}
                {bhkLabel(current.bedrooms) ? ` - ${bhkLabel(current.bedrooms)}` : ""} - {formatArea(current.area)}
              </motion.p>
              <motion.p variants={staggerItem} className="mt-3 text-2xl font-bold">
                <PriceDisplay
                  price={current.price}
                  priceLocked={current.priceLocked}
                  transactionType={current.transactionType}
                  property={{ propertySlug: current.slug, propertyTitle: current.title }}
                  dark
                />
                {!current.priceLocked && current.negotiable ? <span className="ml-3 text-sm font-normal text-ice">Negotiable</span> : null}
              </motion.p>
              <motion.div variants={staggerItem} className="mt-8 flex flex-wrap gap-3">
                <Button href={`/property/${current.slug}`} variant="ice">
                  View property
                </Button>
                <Button variant="ghost" className="border border-white/25 bg-navy/20" onClick={onOpenMatcher} type="button">
                  Find a property
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute right-8 top-1/2 z-10 hidden w-[190px] -translate-y-1/2 grid-cols-1 gap-4 xl:grid">
        {previewImages.map((image, imageIndex) => (
          <button
            key={`${image.url}-${imageIndex}`}
            type="button"
            onClick={() => {
              if (current.images.length > 1) setImageIndex(imageIndex);
              else if (imageIndex < slides.length) setIndex(imageIndex);
            }}
            className={`relative h-[122px] overflow-hidden border bg-white/10 transition duration-200 hover:-translate-y-0.5 hover:border-ice ${
              image.url === cover ? "border-ice" : "border-white/35"
            }`}
            aria-label={`Preview image ${imageIndex + 1}`}
          >
            <Image src={image.url} alt="" fill className="object-cover" sizes="190px" />
            <span className="absolute inset-0 bg-navy/12" />
          </button>
        ))}
      </div>

      <div className="absolute bottom-8 right-6 z-10 flex items-center gap-3">
        <button aria-label="Previous" onClick={prev} className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/12 transition duration-200 hover:-translate-y-0.5 hover:border-ice/60 hover:bg-white/18 active:translate-y-0">
          <ChevronLeft size={18} />
        </button>
        <button aria-label="Next" onClick={next} className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/12 transition duration-200 hover:-translate-y-0.5 hover:border-ice/60 hover:bg-white/18 active:translate-y-0">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2 lg:left-[calc(50%-280px)] lg:translate-x-0">
        {slides.map((s, i) => (
          <button
            key={s.slug}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-10 bg-ice" : "w-5 bg-white/35"}`}
          />
        ))}
      </div>
    </section>
  );
}
