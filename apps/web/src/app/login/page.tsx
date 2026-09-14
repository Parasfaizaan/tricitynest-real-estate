"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    const next = params.get("next");
    if (data.user.role === "SUPER_ADMIN") router.push(next || "/super-admin");
    else if (data.user.role === "ADMIN") router.push(next || "/admin");
    else router.push("/");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-navy px-4">
      <div className="w-full max-w-md rounded-[26px] bg-white p-8">
        <Logo />
        <h1 className="display mt-6 text-3xl text-navy">Staff login</h1>
        <form onSubmit={onSubmit} className="mt-6 grid gap-3">
          <input name="email" type="email" required placeholder="Email" defaultValue="admin@tricityinvestment.com" />
          <input name="password" type="password" required placeholder="Password" defaultValue="Admin@123" />
          <Button type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
        <div className="mt-6 rounded-2xl bg-page p-4 text-xs text-ink-soft">
          <p className="font-semibold text-navy">Demo accounts</p>
          <p className="mt-2">superadmin@tricityinvestment.com / SuperAdmin@123</p>
          <p>admin@tricityinvestment.com / Admin@123</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
