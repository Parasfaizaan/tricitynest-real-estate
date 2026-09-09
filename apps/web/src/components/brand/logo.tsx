import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="TricityNest home">
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-xl border text-[11px] font-bold tracking-[0.12em]",
          inverted ? "border-white/20 bg-white/10 text-ice" : "border-navy/10 bg-navy text-ice"
        )}
      >
        TN
      </span>
      <span className={cn("display text-[1.15rem]", inverted ? "text-white" : "text-navy")}>
        TricityNest
      </span>
    </Link>
  );
}
