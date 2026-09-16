"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Tax = {
  locations: { id: string; name: string }[];
  propertyTypes: { id: string; name: string }[];
  amenities: { id: string; name: string }[];
  builders: { id: string; name: string }[];
};

type ExistingImage = {
  id: string;
  url: string;
  publicId?: string | null;
  alt?: string | null;
  sortOrder?: number;
  isCover?: boolean;
};

type ImageItem =
  | { kind: "existing"; id: string; url: string; sortOrder: number; isCover: boolean }
  | { kind: "new"; id: string; file: File; url: string; sortOrder: number; isCover: boolean };

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
  priceMax?: number | null;
  negotiable?: boolean;
  locality?: string;
  locationId?: string;
  city?: string;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area?: number;
  areaUnit?: string;
  carpetArea?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  balconies?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
  facing?: string | null;
  parking?: boolean;
  furnishing?: string;
  possession?: string;
  possessionDate?: string | null;
  reraNumber?: string | null;
  tagline?: string | null;
  images?: ExistingImage[];
  amenities?: { amenityId?: string; amenity?: { id: string } }[];
  features?: { label: string }[];
  builderId?: string | null;
  deletionPending?: boolean;
};

function numberOrNull(value: FormDataEntryValue | null) {
  if (value == null || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

export function PropertyForm({ tax, initial }: { tax: Tax; initial?: Initial }) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [images, setImages] = useState<ImageItem[]>(() =>
    (initial?.images ?? [])
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((image, index) => ({
        kind: "existing" as const,
        id: image.id,
        url: image.url,
        sortOrder: index,
        isCover: Boolean(image.isCover) || index === 0,
      }))
  );

  const coverId = useMemo(() => images.find((image) => image.isCover)?.id, [images]);

  function normalize(next: ImageItem[]) {
    const hasCover = next.some((image) => image.isCover);
    return next.map((image, index) => ({
      ...image,
      sortOrder: index,
      isCover: hasCover ? image.isCover : index === 0,
    }));
  }

  function addImages(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files).map((file, index) => ({
      kind: "new" as const,
      id: `${file.name}-${file.lastModified}-${index}-${crypto.randomUUID()}`,
      file,
      url: URL.createObjectURL(file),
      sortOrder: images.length + index,
      isCover: images.length === 0 && index === 0,
    }));
    setImages((current) => normalize([...current, ...selected]));
  }

  function removeImage(id: string) {
    setImages((current) => normalize(current.filter((image) => image.id !== id)));
  }

  function moveImage(id: string, direction: -1 | 1) {
    setImages((current) => {
      const index = current.findIndex((image) => image.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = current.slice();
      [next[index], next[target]] = [next[target], next[index]];
      return normalize(next);
    });
  }

  function setCover(id: string) {
    setImages((current) => current.map((image) => ({ ...image, isCover: image.id === id })));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    const fd = new FormData(e.currentTarget);
    const features = String(fd.get("features") || "")
      .split("\n")
      .map((feature) => feature.trim())
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
      priceMax: numberOrNull(fd.get("priceMax")),
      negotiable: fd.get("negotiable") === "on",
      locality: fd.get("locality"),
      locationId: fd.get("locationId"),
      city: fd.get("city"),
      postalCode: textOrNull(fd.get("postalCode")),
      latitude: numberOrNull(fd.get("latitude")),
      longitude: numberOrNull(fd.get("longitude")),
      area: Number(fd.get("area")),
      areaUnit: fd.get("areaUnit") || "sqft",
      carpetArea: numberOrNull(fd.get("carpetArea")),
      bedrooms: numberOrNull(fd.get("bedrooms")),
      bathrooms: numberOrNull(fd.get("bathrooms")),
      balconies: numberOrNull(fd.get("balconies")),
      floor: numberOrNull(fd.get("floor")),
      totalFloors: numberOrNull(fd.get("totalFloors")),
      facing: textOrNull(fd.get("facing")),
      parking: fd.get("parking") === "on",
      furnishing: fd.get("furnishing"),
      possession: fd.get("possession"),
      possessionDate: textOrNull(fd.get("possessionDate")),
      reraNumber: textOrNull(fd.get("reraNumber")),
      tagline: textOrNull(fd.get("tagline")),
      builderId: fd.get("builderId") || null,
      amenityIds: fd.getAll("amenityIds").map(String),
      features,
      existingImages: images
        .filter((image): image is Extract<ImageItem, { kind: "existing" }> => image.kind === "existing")
        .map((image) => ({ id: image.id, sortOrder: image.sortOrder, isCover: image.isCover })),
    };

    const body = new FormData();
    body.set("property", JSON.stringify(payload));
    images
      .filter((image): image is Extract<ImageItem, { kind: "new" }> => image.kind === "new")
      .forEach((image) => body.append("images", image.file));

    const url = editing ? `/api/admin/properties/${initial!.id}` : "/api/admin/properties";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      body,
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || (editing ? "Property update failed" : "Property creation failed"));
      return;
    }
    setSuccess(editing ? "Property updated successfully" : "Property created successfully");
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
    <>
    <form onSubmit={onSubmit} className="grid max-w-5xl gap-6">
      <Section title="Images">
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => addImages(e.target.files)} />
        {images.length === 0 ? (
          <p className="text-sm text-ink-soft">Upload at least one image before saving.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <div key={image.id} className="overflow-hidden rounded-lg border border-line bg-white">
                <img src={image.url} alt="" className="h-40 w-full object-cover" />
                <div className="grid gap-2 p-3 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={coverId === image.id} onChange={() => setCover(image.id)} />
                    Cover image
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="underline disabled:text-ink-soft" disabled={index === 0} onClick={() => moveImage(image.id, -1)}>
                      Move up
                    </button>
                    <button type="button" className="underline disabled:text-ink-soft" disabled={index === images.length - 1} onClick={() => moveImage(image.id, 1)}>
                      Move down
                    </button>
                    <button type="button" className="text-red-700 underline" onClick={() => removeImage(image.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
      <Section title="Basic information">
        <input name="title" required defaultValue={initial?.title} placeholder="Property name" />
        <input name="shortDescription" required defaultValue={initial?.shortDescription} placeholder="Short description" />
        <textarea name="description" required rows={5} defaultValue={initial?.description} placeholder="Full description" />
        <div className="grid gap-3 md:grid-cols-3">
          <select name="category" defaultValue={initial?.category ?? "RESIDENTIAL"}>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
          <select name="propertyTypeId" defaultValue={initial?.propertyTypeId} required>
            {tax.propertyTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={initial?.featured} /> Featured
          </label>
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid gap-3 md:grid-cols-3">
          <input name="price" type="number" min="1" required defaultValue={initial?.price} placeholder="Price" />
          <input name="priceMax" type="number" min="1" defaultValue={initial?.priceMax ?? undefined} placeholder="Maximum price" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="negotiable" defaultChecked={initial?.negotiable ?? true} /> Negotiable
          </label>
        </div>
      </Section>

      <Section title="Location">
        <div className="grid gap-3 md:grid-cols-3">
          <select name="locationId" defaultValue={initial?.locationId} required>
            {tax.locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <input name="city" required defaultValue={initial?.city} placeholder="City" />
          <input name="locality" required defaultValue={initial?.locality} placeholder="Locality" />
          <input name="postalCode" defaultValue={initial?.postalCode ?? ""} placeholder="Postal code" />
          <input name="latitude" type="number" step="any" defaultValue={initial?.latitude ?? undefined} placeholder="Latitude" />
          <input name="longitude" type="number" step="any" defaultValue={initial?.longitude ?? undefined} placeholder="Longitude" />
        </div>
      </Section>

      <Section title="Property details">
        <div className="grid gap-3 md:grid-cols-4">
          <input name="area" type="number" min="1" required defaultValue={initial?.area} placeholder="Area" />
          <input name="areaUnit" defaultValue={initial?.areaUnit ?? "sqft"} placeholder="Area unit" />
          <input name="carpetArea" type="number" min="1" defaultValue={initial?.carpetArea ?? undefined} placeholder="Carpet area" />
          <input name="bedrooms" type="number" min="0" defaultValue={initial?.bedrooms ?? undefined} placeholder="Bedrooms / BHK" />
          <input name="bathrooms" type="number" min="0" defaultValue={initial?.bathrooms ?? undefined} placeholder="Bathrooms" />
          <input name="balconies" type="number" min="0" defaultValue={initial?.balconies ?? undefined} placeholder="Balconies" />
          <input name="floor" type="number" defaultValue={initial?.floor ?? undefined} placeholder="Floor" />
          <input name="totalFloors" type="number" min="0" defaultValue={initial?.totalFloors ?? undefined} placeholder="Total floors" />
          <input name="facing" defaultValue={initial?.facing ?? ""} placeholder="Facing" />
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
          <input name="possessionDate" defaultValue={initial?.possessionDate ?? ""} placeholder="Possession date" />
          <input name="reraNumber" defaultValue={initial?.reraNumber ?? ""} placeholder="RERA number" />
          <select name="builderId" defaultValue={initial?.builderId ?? ""}>
            <option value="">No builder</option>
            {tax.builders.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="parking" defaultChecked={initial?.parking} /> Parking
          </label>
        </div>
        <input name="tagline" defaultValue={initial?.tagline ?? ""} placeholder="Tagline" />
      </Section>

      <Section title="Amenities and features">
        <fieldset className="grid grid-cols-2 gap-2 md:grid-cols-4">
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
        <textarea
          name="features"
          rows={4}
          defaultValue={initial?.features?.map((feature) => feature.label).join("\n")}
          placeholder="Features, one per line"
        />
      </Section>

      

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={busy || images.length === 0}>
          {busy ? (editing ? "Updating property..." : "Creating property...") : editing ? "Save changes" : "Create property"}
        </Button>
        {busy && <p className="text-sm text-ink-soft">Uploading images and saving property...</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>

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
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-lg border border-line bg-white p-5">
      <h2 className="text-base font-semibold text-navy">{title}</h2>
      {children}
    </section>
  );
}
