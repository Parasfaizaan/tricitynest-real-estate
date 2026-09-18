"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Step = "phone" | "otp" | "profile";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    const fd = new FormData(e.currentTarget);
    const nextPhone = String(fd.get("phone") || "");
    const res = await fetch("/api/auth/otp/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: nextPhone }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not send OTP");
      return;
    }
    setPhone(data.phone || nextPhone);
    setInfo(data.devOtp ? `Development OTP: ${data.devOtp}` : "OTP sent to your phone.");
    setStep("otp");
  }

  async function verifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: otp }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "OTP verification failed");
      return;
    }
    setStep("profile");
    router.refresh();
  }

  if (step === "profile") {
    return (
      <div className="grid gap-4">
        <div className="rounded-lg border border-line bg-page p-4">
          <p className="font-semibold text-navy">Phone verified</p>
          <p className="mt-2 text-sm text-ink-soft">
            Complete your profile now, or skip and continue browsing with prices unlocked.
          </p>
        </div>
        <Button href={`/profile?next=${encodeURIComponent(next)}`} className="!text-white">Complete profile</Button>
        <Button type="button" variant="outline" onClick={() => router.push(next)}>
          Skip for now
        </Button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={verifyOtp} className="grid gap-3">
        <p className="text-sm text-ink-soft">Enter the OTP sent to {phone}.</p>
        <input
          name="otp"
          inputMode="numeric"
          required
          minLength={4}
          maxLength={10}
          value={otp}
          onChange={(event) => setOtp(event.target.value)}
          placeholder="Enter OTP"
        />
        <Button type="submit" disabled={busy}>{busy ? "Verifying..." : "Verify OTP"}</Button>
        <button type="button" className="text-left text-sm text-navy underline" onClick={() => setStep("phone")}>
          Change phone number
        </button>
        {info && <p className="text-sm text-green-700">{info}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={sendOtp} className="grid gap-3">
      <input name="phone" required inputMode="tel" placeholder="Phone number" />
      <Button type="submit" disabled={busy}>{busy ? "Sending OTP..." : "Send OTP"}</Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
