"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProfilePhotoInput } from "@/components/forms/profile-photo-input";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        password: fd.get("password"),
        profilePhotoUrl: fd.get("profilePhotoUrl"),
        socialLinks: fd.get("socialLinks"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Signup failed");
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <ProfilePhotoInput onError={setError} />
      <input name="name" required placeholder="Full name" />
      <input name="email" type="email" required placeholder="Email" />
      <input name="phone" required placeholder="Phone number" />
      <input name="password" type="password" required minLength={8} placeholder="Password" />
      <textarea name="socialLinks" rows={3} placeholder="Social links optional" />
      <Button type="submit" disabled={busy}>{busy ? "Creating account..." : "Create account"}</Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
