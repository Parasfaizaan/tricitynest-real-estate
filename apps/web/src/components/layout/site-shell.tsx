"use client";

import { useEffect, useState } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { PropertyMatcher } from "@/components/matcher/property-matcher";

type Tax = {
  locations: { name: string; slug: string }[];
  propertyTypes: { name: string; slug: string; category: string }[];
};

export function SiteShell({
  children,
  taxonomies,
  autoOpenMatcher = false,
}: {
  children: React.ReactNode;
  taxonomies: Tax;
  autoOpenMatcher?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!autoOpenMatcher) return;
    try {
      if (sessionStorage.getItem("tn_matcher_closed") === "1") return;
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => setOpen(true), 160);
    return () => window.clearTimeout(t);
  }, [autoOpenMatcher]);

  useEffect(() => {
    const openMatcher = () => setOpen(true);
    window.addEventListener("tn:open-matcher", openMatcher);
    return () => window.removeEventListener("tn:open-matcher", openMatcher);
  }, []);

  return (
    <>
      <Header onOpenMatcher={() => setOpen(true)} />
      <main>{children}</main>
      <Footer />
      <PropertyMatcher open={open} onClose={() => setOpen(false)} taxonomies={taxonomies} />
    </>
  );
}
