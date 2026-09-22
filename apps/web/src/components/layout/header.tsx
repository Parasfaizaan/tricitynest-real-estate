"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { clearBrowserSessionState } from "@/lib/client-logout";
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

type HeaderUser = {
  id: string;
  name: string;
  email: string;
  profilePhotoUrl?: string | null;
};

export function Header({ onOpenMatcher }: { onOpenMatcher?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const home = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 56);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) setUser(data?.user ?? null);
      })
      .catch(() => {
        if (active) setUser(null);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    if (open) setOpen(false);
  }

  const solid = !home || scrolled || open;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearBrowserSessionState();
    setUser(null);
    setAccountOpen(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        solid
          ? "border-b border-white/10 bg-navy/94 text-white shadow-[0_12px_42px_rgba(16,37,31,0.22)] backdrop-blur-md"
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
          {user ? (
            <div className="relative">
              <button
                type="button"
                aria-label="Open account menu"
                title="Account"
                onClick={() => setAccountOpen((value) => !value)}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/15"
              >
                <Avatar user={user} />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-14 w-48 rounded-lg border border-line bg-white p-2 text-sm text-navy shadow-[0_16px_40px_rgba(16,37,31,0.18)]">
                  <Link href="/profile" className="block rounded-md px-3 py-2 hover:bg-page" onClick={() => setAccountOpen(false)}>
                    Profile
                  </Link>
                  <button type="button" onClick={logout} className="block w-full rounded-md px-3 py-2 text-left hover:bg-page">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button href="/login" variant="ghost" className="h-10 border border-white/15 px-5">
              Login
            </Button>
          )}
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
            className="overflow-hidden border-t border-white/10 bg-navy lg:hidden"
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
              {user ? (
                <div className="grid gap-3">
                  <Link href="/profile" className="flex items-center gap-3 rounded-full border border-white/15 px-3 py-2 text-white/90">
                    <Avatar user={user} />
                    <span>{user.name || "Profile"}</span>
                  </Link>
                  <button type="button" onClick={logout} className="rounded-full border border-white/15 px-4 py-2 text-left text-white/90">
                    Logout
                  </button>
                </div>
              ) : (
                <Button href="/login" variant="ghost" className="border border-white/15">
                  Login
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Avatar({ user }: { user: HeaderUser }) {
  if (user.profilePhotoUrl) {
    return <img src={user.profilePhotoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />;
  }
  const initial = (user.name || user.email || "U").slice(0, 1).toUpperCase();
  return <span className="grid h-8 w-8 place-items-center rounded-full bg-ice text-sm font-semibold text-navy">{initial}</span>;
}
