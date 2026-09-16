"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";

type ProfilePhotoInputProps = {
  defaultValue?: string | null;
  userName?: string | null;
  onError?: (message: string) => void;
};

export function ProfilePhotoInput({ defaultValue, userName, onError }: ProfilePhotoInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);

  const initial = userName?.trim().charAt(0).toUpperCase() || "U";

  async function uploadPhoto(file: File) {
    setUploading(true);
    onError?.("");
    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/profile-photo", {
      method: "POST",
      body,
    });
    const data = await res.json().catch(() => ({}));
    setUploading(false);

    if (!res.ok) {
      onError?.(data.error || "Profile image upload failed");
      return;
    }

    setPhotoUrl(data.url);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <input type="hidden" name="profilePhotoUrl" value={photoUrl} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative grid h-28 w-28 place-items-center overflow-hidden rounded-full border border-line bg-ice/40 text-navy transition hover:-translate-y-0.5 hover:border-navy/30"
        aria-label={photoUrl ? "Update profile image" : "Upload profile image"}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl font-semibold">{initial}</span>
        )}
        <span className="absolute inset-0 grid place-items-center bg-navy/45 text-white opacity-0 transition group-hover:opacity-100">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadPhoto(file);
          e.currentTarget.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-sm font-medium text-navy underline disabled:text-ink-soft"
      >
        {uploading ? "Uploading image..." : photoUrl ? "Update profile image" : "Upload profile image"}
      </button>
    </div>
  );
}
