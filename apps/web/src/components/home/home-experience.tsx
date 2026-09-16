"use client";

import { HeroSlider, type HeroSlide } from "./hero-slider";
import {
  TrustMetrics,
  FeaturedRow,
  WhyUs,
  LocationsGrid,
  Testimonials,
  AboutTeaser,
  ConsultationForm,
  Newsletter,
} from "./landing-sections";
import type { CardProperty } from "@/components/property/card";

export function HomeExperience({
  slides,
  featured,
  locations,
  count,
}: {
  slides: HeroSlide[];
  featured: CardProperty[];
  locations: { name: string; slug: string; imageUrl: string | null; _count?: { properties: number } }[];
  count: number;
}) {
  return (
    <>
      <HeroSlider slides={slides} onOpenMatcher={() => {
        window.dispatchEvent(new Event("tn:open-matcher"));
      }} />
      <TrustMetrics count={count} />
      <FeaturedRow properties={featured} />
      <LocationsGrid locations={locations} />
      <WhyUs />
      {/* <Testimonials /> */}
      {/* <AboutTeaser /> */}
      <ConsultationForm />
      <Newsletter />
    </>
  );
}
