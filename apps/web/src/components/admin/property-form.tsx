"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Tax = {
  locations: { id: string; name: string }[];
  propertyTypes: { id: string; name: string }[];
  amenities: { id: string; name: string }[];
  builders: { id: string; name: string }[];
};

type Initial = {
  id?: string;
  title?: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  propertyTypeId?: string;
  transactionType?: string;
  status?: string;
  featured?: boolean;
  price?: number;
  locality?: string;
  locationId?: string;
  city?: string;
  area?: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  furnishing?: string;
  possession?: string;
  reraNumber?: string | null;
  tagline?: string | null;
  images?: { url: string }[];
  amenities?: { amenityId?: string; amenity?: { id: string } }[];
  builderId?: string | null;
  deletionPending?: boolean;
};

export function PropertyForm({ tax, initial }: { tax: Tax; initial?: Initial }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const editing = Boolean(initial?.id);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const amenityIds = fd.getAll("amenityIds").map(String);
    const images = String(fd.get("images") || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      title: fd.get("title"),
      shortDescription: fd.get("shortDescription"),
      description: fd.get("description"),
      category: fd.get("category"),
      propertyTypeId: fd.get("propertyTypeId"),
      transactionType: fd.get("transactionType"),
      status: fd.get("status"),
      featured: fd.get("featured") === "on",
      price: Number(fd.get("price")),
      locality: fd.get("locality"),
      locationId: fd.get("locationId"),
      city: fd.get("city"),
      area: Number(fd.get("area")),
      bedrooms: fd.get("bedrooms") ? Number(fd.get("bedrooms")) : null,
      bathrooms: fd.get("bathrooms") ? Number(fd.get("bathrooms")) : null,
      furnishing: fd.get("furnishing"),
      possession: fd.get("possession"),
      reraNumber: fd.get("reraNumber") || null,
      tagline: fd.get("tagline") || null,
      builderId: fd.get("builderId") || null,
      images,
      amenityIds,
    };
    const url = editing ? `/api/admin/properties/${initial!.id}` : "/api/admin/properties";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    router.push("/admin/properties");
    router.refresh();
  }

  async function requestDelete(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/admin/properties/${initial!.id}/delete-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: fd.get("reason"), notes: fd.get("notes") }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not request deletion");
      return;
    }
    setReasonOpen(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-4">
      <input name="title" required defaultValue={initial?.title} placeholder="Title" />
      <input name="shortDescription" required defaultValue={initial?.shortDescription} placeholder="Short description" />
      <textarea name="description" required rows={5} defaultValue={initial?.description} placeholder="Description" />
      <div className="grid gap-3 md:grid-cols-2">
        <select name="category" defaultValue={initial?.category ?? "RESIDENTIAL"}>
          <option value="RESIDENTIAL">Residential</option>
          <option value="COMMERCIAL">Commercial</option>
        </select>
        <select name="propertyTypeId" defaultValue={initial?.propertyTypeId} required>
          {tax.propertyTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select name="transactionType" defaultValue={initial?.transactionType ?? "BUY"}>
          <option value="BUY">Buy</option>
          <option value="RENT">Rent</option>
          <option value="INVEST">Invest</option>
        </select>
        <select name="status" defaultValue={initial?.status ?? "DRAFT"}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select name="locationId" defaultValue={initial?.locationId} required>
          {tax.locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <select name="builderId" defaultValue={initial?.builderId ?? ""}>
          <option value="">No builder</option>
          {tax.builders.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <input name="price" type="number" required defaultValue={initial?.price} placeholder="Price" />
        <input name="area" type="number" required defaultValue={initial?.area} placeholder="Area sqft" />
        <input name="bedrooms" type="number" defaultValue={initial?.bedrooms ?? undefined} placeholder="Bedrooms" />
        <input name="bathrooms" type="number" defaultValue={initial?.bathrooms ?? undefined} placeholder="Bathrooms" />
        <input name="locality" required defaultValue={initial?.locality} placeholder="Locality" />
        <input name="city" required defaultValue={initial?.city} placeholder="City" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <select name="furnishing" defaultValue={initial?.furnishing ?? "UNFURNISHED"}>
          <option value="UNFURNISHED">Unfurnished</option>
          <option value="SEMI_FURNISHED">Semi furnished</option>
          <option value="FURNISHED">Furnished</option>
        </select>
        <select name="possession" defaultValue={initial?.possession ?? "READY"}>
          <option value="READY">Ready</option>
          <option value="UNDER_CONSTRUCTION">Under construction</option>
          <option value="NEW_LAUNCH">New launch</option>
        </select>
      </div>
      <input name="reraNumber" defaultValue={initial?.reraNumber ?? ""} placeholder="RERA number" />
      <input name="tagline" defaultValue={initial?.tagline ?? ""} placeholder="Tagline" />
      <textarea
        name="images"
        rows={4}
        required
        defaultValue={initial?.images?.map((i) => i.url).join("\n")}
        placeholder="Image URLs, one per line"
      />
      <fieldset className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {tax.amenities.map((a) => (
          <label key={a.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="amenityIds"
              value={a.id}
              defaultChecked={initial?.amenities?.some((x) => (x.amenityId || x.amenity?.id) === a.id)}
            />
            {a.name}
          </label>
        ))}
      </fieldset>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" defaultChecked={initial?.featured} /> Featured
      </label>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : editing ? "Save changes" : "Create property"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {editing && !initial?.deletionPending && (
        <button type="button" className="text-left text-sm text-red-700 underline" onClick={() => setReasonOpen(true)}>
          Request deletion
        </button>
      )}
      {initial?.deletionPending && <p className="text-sm text-ink-soft">Deletion approval pending with Super Admin.</p>}
      {reasonOpen && (
        <div className="card-surface p-4">
          <p className="font-medium">Request deletion</p>
          <form onSubmit={requestDelete} className="mt-3 grid gap-2">
            <textarea name="reason" required minLength={8} placeholder="Reason (required)" rows={3} />
            <textarea name="notes" placeholder="Additional notes" rows={2} />
            <Button type="submit" variant="outline">
              Submit request
            </Button>
          </form>
        </div>
      )}
    </form>
  );
}
