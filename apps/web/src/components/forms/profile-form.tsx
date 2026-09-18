"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProfilePhotoInput } from "@/components/forms/profile-photo-input";
import { isPhoneOnlyEmail } from "@/lib/phone";

type UserProfile = {
  name?: string;
  email?: string;
  phone?: string | null;
  profilePhotoUrl?: string | null;
  socialLinks?: string | null;
};

export function ProfileForm({ user }: { user: UserProfile }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        profilePhotoUrl: fd.get("profilePhotoUrl"),
        socialLinks: fd.get("socialLinks"),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Profile update failed");
      return;
    }
    setSuccess("Profile saved successfully");
    router.push(params.get("next") || "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <ProfilePhotoInput defaultValue={user.profilePhotoUrl} userName={user.name} onError={setError} />
      <input
        name="email"
        type="email"
        defaultValue={isPhoneOnlyEmail(user.email) ? "" : user.email}
        placeholder="Email optional"
      />
      <input name="name" required defaultValue={user.name} placeholder="Full name" />
      <input name="phone" required defaultValue={user.phone ?? ""} placeholder="Phone number" />
      <textarea name="socialLinks" rows={4} defaultValue={user.socialLinks ?? ""} placeholder="Social links optional, one per line" />
      <Button type="submit" disabled={busy}>{busy ? "Saving profile..." : "Save profile"}</Button>
      {success && <p className="text-sm text-green-700">{success}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
