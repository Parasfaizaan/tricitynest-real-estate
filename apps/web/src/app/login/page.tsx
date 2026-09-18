"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [otpError, setOtpError] = useState("");
  const [otpInfo, setOtpInfo] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const oauthError = params.get("error");
  const oauthErrorMessage =
    oauthError === "account_disabled"
      ? "Your account is suspended. Please contact admin."
      : oauthError
        ? "Google login could not be completed."
        : "";
  const next = params.get("next") || "/";

  async function onSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOtpBusy(true);
    setOtpError("");
    setOtpInfo("");
    const fd = new FormData(e.currentTarget);
    const nextPhone = String(fd.get("phone") || "");
    const res = await fetch("/api/auth/otp/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: nextPhone }),
    });
    const data = await res.json().catch(() => ({}));
    setOtpBusy(false);
    if (!res.ok) {
      setOtpError(data.error || "Could not send OTP");
      return;
    }
    setPhone(data.phone || nextPhone);
    setOtpSent(true);
    setOtpInfo(data.devOtp ? `Development OTP: ${data.devOtp}` : "OTP sent to your phone.");
  }

  async function onVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOtpBusy(true);
    setOtpError("");
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: otp }),
    });
    const data = await res.json().catch(() => ({}));
    setOtpBusy(false);
    if (!res.ok) {
      setOtpError(data.error || "OTP verification failed");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-navy px-4">
      <div className="w-full max-w-md rounded-[26px] bg-white p-8">
        <Logo />
        <h1 className="display mt-6 text-3xl text-navy">User login</h1>
        <a
          href={`/api/auth/google?next=${encodeURIComponent(next)}`}
          className="mt-6 flex min-h-11 items-center justify-center rounded-full border border-line bg-white px-5 text-sm font-medium text-navy"
        >
          Continue with Google
        </a>
        {oauthErrorMessage && <p className="mt-3 text-sm text-red-600">{oauthErrorMessage}</p>}
        <p className="mt-4 text-sm text-ink-soft">
          New user? <a href="/signup" className="text-navy underline">Sign up</a>
        </p>
        <div className="my-6 h-px bg-line" />
        <p className="text-sm font-semibold text-navy">Login with OTP</p>
        {!otpSent ? (
          <form onSubmit={onSendOtp} className="mt-4 grid gap-3">
            <input name="phone" inputMode="tel" required placeholder="Phone number" />
            <Button type="submit" disabled={otpBusy}>
              {otpBusy ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={onVerifyOtp} className="mt-4 grid gap-3">
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
            <Button type="submit" disabled={otpBusy}>
              {otpBusy ? "Verifying..." : "Verify OTP"}
            </Button>
            <button type="button" className="text-left text-sm text-navy underline" onClick={() => setOtpSent(false)}>
              Change phone number
            </button>
          </form>
        )}
        {otpInfo && <p className="mt-3 text-sm text-green-700">{otpInfo}</p>}
        {otpError && <p className="mt-3 text-sm text-red-600">{otpError}</p>}
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
