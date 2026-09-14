import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: "primary" | "ghost" | "ice" | "dark" | "outline";
  children: ReactNode;
};

export function Button({ href, variant = "primary", className, children, ...rest }: Props) {
  const styles = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-tight transition-all duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[0.99]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice focus-visible:ring-offset-2",
    variant === "primary" && "bg-navy text-white hover:bg-navy-2",
    variant === "dark" && "bg-navy-2 text-white hover:bg-navy",
    variant === "ice" && "bg-ice text-navy hover:bg-ice-2",
    variant === "ghost" && "bg-transparent text-white hover:bg-white/10",
    variant === "outline" && "border border-line bg-white text-navy hover:border-navy/30",
    className
  );
  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }
  return (
    <button className={styles} {...rest}>
      {children}
    </button>
  );
}
