"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motionDurations, motionEase } from "@/components/motion/variants";

const links = [
  { href: "/properties", label: "Properties" },
  { href: "/properties?category=residential", label: "Residential" },
  { href: "/properties?category=commercial", label: "Commercial" },
  { href: "/locations", label: "Locations" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header({ onOpenMatcher }: { onOpenMatcher?: () => void }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const home = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    if (open) setOpen(false);
  }

  const solid = !home || scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "border-b border-white/10 bg-[#061827]/94 text-white shadow-[0_12px_42px_rgba(6,24,39,0.2)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent text-white"
      )}
    >
      <div className="container-px flex h-[72px] items-center justify-between gap-6">
        <Logo inverted />
        <nav className="hidden items-center gap-7 text-[13px] font-medium tracking-wide lg:flex">
          {links.map((l) => (
            <Link key={l.href + l.label} href={l.href} className="opacity-80 transition hover:opacity-100">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ice" className="h-10 px-5" onClick={onOpenMatcher} type="button">
            Find a Property
          </Button>
          <Button href="/login" variant="ghost" className="h-10 border border-white/15 px-5">
            Login
          </Button>
        </div>
        <button
          className="grid h-11 w-11 place-items-center rounded-full border border-white/15 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: motionDurations.button, ease: motionEase }}
            className="overflow-hidden border-t border-white/10 bg-[#061827] lg:hidden"
          >
            <div className="container-px flex flex-col gap-4 py-6">
              {links.map((l) => (
                <Link key={l.href + l.label} href={l.href} className="text-lg text-white/90">
                  {l.label}
                </Link>
              ))}
              <Button variant="ice" onClick={onOpenMatcher} type="button">
                Find a Property
              </Button>
              <Button href="/login" variant="ghost" className="border border-white/15">
                Login
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
