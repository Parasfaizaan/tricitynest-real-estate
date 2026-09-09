import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const cols = [
  {
    title: "Explore",
    links: [
      { href: "/properties", label: "All properties" },
      { href: "/properties?category=residential", label: "Residential" },
      { href: "/properties?category=commercial", label: "Commercial" },
      { href: "/locations", label: "Locations" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/sell", label: "Sell with us" },
      { href: "/builders", label: "Builders" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/rera", label: "RERA" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-px grid gap-12 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo inverted />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
            Verified homes, plots and commercial spaces across Mohali, Chandigarh, Zirakpur and Kharar — with prices you can actually trust.
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <p className="eyebrow text-ice">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-px flex flex-col gap-2 py-5 text-xs text-white/45 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} TricityNest. All rights reserved.</span>
          <span>Chandigarh · Mohali · Zirakpur · Kharar</span>
        </div>
      </div>
    </footer>
  );
}
