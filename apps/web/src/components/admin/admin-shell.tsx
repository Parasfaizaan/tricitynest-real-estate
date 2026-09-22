"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { clearBrowserSessionState } from "@/lib/client-logout";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/leads", label: "Leads / inquiries" },
  // { href: "/admin/inbox", label: "Inbox" },
  // { href: "/admin/taxonomies", label: "Taxonomies" },
];

const superLinks = [
  { href: "/super-admin", label: "Overview" },
  { href: "/super-admin/deletions", label: "Deletions" },
  { href: "/super-admin/users", label: "Users" },
  { href: "/super-admin/audit", label: "Audit log" },
  { href: "/admin/properties", label: "Properties" },
];

export function AdminShell({
  children,
  role,
  name,
}: {
  children: React.ReactNode;
  role: string;
  name: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const superMode = pathname.startsWith("/super-admin");
  const links = superMode ? superLinks : adminLinks;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearBrowserSessionState();
    router.push("/staff-login");
  }

  return (
    <div className="min-h-screen bg-page">
      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-navy text-white md:flex md:flex-col">
        <div className="p-5">
          <Logo inverted />
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-ice">{superMode ? "Super admin" : "Admin"}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "block rounded-xl px-3 py-2.5 text-sm",
                pathname === l.href ? "bg-white/10 text-ice" : "text-white/75 hover:bg-white/5"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 text-xs text-white/50">
          <p>{name}</p>
          <p>{role}</p>
          {role === "SUPER_ADMIN" && !superMode && (
            <Link href="/super-admin" className="mt-2 block text-ice">
              Super admin →
            </Link>
          )}
          <button onClick={logout} className="mt-3 text-white/70 hover:text-white">
            Sign out
          </button>
        </div>
      </aside>
      <div className="md:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur md:px-8">
          <p className="text-sm font-medium text-navy">{superMode ? "Super admin" : "Admin desk"}</p>
          <div className="flex gap-3 text-sm">
            <Link href="/" className="text-ink-soft">
              View site
            </Link>
            <button onClick={logout}>Sign out</button>
          </div>
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
