"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FindYourHomePage() {
  const router = useRouter();
  useEffect(() => {
    try {
      sessionStorage.removeItem("tn_matcher_closed");
    } catch {}
    router.replace("/");
  }, [router]);
  return <div className="grid min-h-screen place-items-center text-ink-soft">Opening matcher…</div>;
}
