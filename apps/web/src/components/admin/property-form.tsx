"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Bath,
  Building2,
  Car,
  Dumbbell,
  Home,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Trees,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CITY_OPTIONS, CITY_SUB_LOCATIONS } from "@/lib/location-options";

type Tax = {
  locations: { id: string; name: string; city: string }[];
  propertyTypes: { id: string; name: string; category: string }[];
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
  listingType?: string | null;
  sellerName?: string | null;
  sellerPhone?: string | null;
  bhk?: number | null;
  locality?: string;
  sector?: string | null;
  projectName?: string | null;
  locationId?: string;
  city?: string;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  area?: number;
  areaUnit?: string;
  superArea?: number | null;
  builtUpArea?: number | null;
  carpetArea?: number | null;
  otherRooms?: string | null;
  furnishingItems?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  balconies?: number | null;
  floor?: number | null;
  floorLabel?: string | null;
  totalFloors?: number | null;
  facing?: string | null;
  parking?: boolean;
  coveredParking?: number | null;
  openParking?: number | null;
  plotLength?: number | null;
  plotBreadth?: number | null;
  floorsAllowed?: number | null;
  boundaryWall?: boolean | null;
  openSides?: number | null;
  constructionDone?: boolean | null;
  furnishing?: string;
  possession?: string;
  possessionDate?: string | null;
  propertyAge?: string | null;
  reraNumber?: string | null;
  tagline?: string | null;
  commercialSubtype?: string | null;
  locatedInside?: string | null;
  washroomType?: string | null;
  parkingType?: string | null;
  entranceWidth?: number | null;
  ceilingHeight?: number | null;
  images?: ExistingImage[];
  amenities?: { amenityId?: string; amenity?: { id: string } }[];
  features?: { label: string }[];
  builderId?: string | null;
  deletionPending?: boolean;
};

const MIN_IMAGES = 5;
const MAX_IMAGES = 15;

const steps = [
  "Listing",
  "Category",
  "Location",
  "Configuration",
  "Furnishing",
  "Floors",
  "Status",
  "Photos",
  "Price",
  "Description",
];

const otherRooms = ["Pooja Room", "Study Room", "Servant Room", "Store Room"];
const areaUnits = ["sq.ft.", "sq.yards", "sq.m.", "acres", "marla", "cents"];
const totalFloorOptions = Array.from({ length: 51 }, (_, index) => index);
const propertyFloorOptions = [
  { value: -2, label: "Basement" },
  { value: -1, label: "Lower Ground" },
  { value: 0, label: "Ground Floor" },
  ...Array.from({ length: 50 }, (_, index) => ({ value: index + 1, label: String(index + 1) })),
];
const parkingCountOptions = Array.from({ length: 11 }, (_, index) => index);
const facingOptions = ["East", "West", "North", "South", "North-East", "North-West", "South-East", "South-West", "Park Facing", "Road Facing"];
const propertyAgeOptions = ["0-1 years", "1-5 years", "5-10 years", "10+ years"];
const completionOptions = ["Within 3 months", "Within 6 months", "Within 1 year", "Within 2 years", "More than 2 years"];
const furnishingItems = [
  "AC",
  "TV",
  "Beds",
  "Wardrobe",
  "Geyser",
  "Light",
  "Fans",
  "Sofa",
  "Washing Machine",
  "Stove",
  "Fridge",
  "Water Purifier",
  "Microwave",
  "Modular Kitchen",
  "Chimney",
  "Dining Table",
];

function numberOrNull(value: FormDataEntryValue | null) {
  if (value == null || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function textOrNull(value: FormDataEntryValue | null) {
  const text = String(value || "").trim();
  return text || null;
}

function splitList(value?: string | null) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function moneyPerArea(price: number, area: number) {
  if (!price || !area) return "";
  return Math.round(price / area).toLocaleString("en-IN");
}

function initialSubLocation(city?: string, value?: string | null) {
  const text = String(value || "").trim();
  if (!city || !text) return { subLocation: "", otherLocation: "" };
  const exists = (CITY_SUB_LOCATIONS[city] ?? []).some((option) => option.value === text);
  return exists ? { subLocation: text, otherLocation: "" } : { subLocation: "Other", otherLocation: text };
}

export function PropertyForm({ tax, initial }: { tax: Tax; initial?: Initial }) {
  const router = useRouter();
  const editing = Boolean(initial?.id);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [category, setCategory] = useState(initial?.category ?? "RESIDENTIAL");
  const [listingType, setListingType] = useState(initial?.listingType ?? "FRESH");
  const [selectedCity, setSelectedCity] = useState(initial?.city ?? "");
  const [subLocation, setSubLocation] = useState(() => initialSubLocation(initial?.city, initial?.sector || initial?.locality).subLocation);
  const [otherLocation, setOtherLocation] = useState(() => initialSubLocation(initial?.city, initial?.sector || initial?.locality).otherLocation);
  const [propertyTypeId, setPropertyTypeId] = useState(initial?.propertyTypeId ?? "");
  const [furnishing, setFurnishing] = useState(initial?.furnishing ?? "UNFURNISHED");
  const [possession, setPossession] = useState(initial?.possession ?? "READY");
  const [bhk, setBhk] = useState(initial?.bhk ?? initial?.bedrooms ?? 0);
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [superArea, setSuperArea] = useState(initial?.superArea ?? initial?.area ?? 0);
  const [areaUnit, setAreaUnit] = useState(initial?.areaUnit ?? "sq.ft.");
  const [dragId, setDragId] = useState<string | null>(null);
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

  const typeOptions = useMemo(() => {
    const filtered = tax.propertyTypes.filter((type) => type.category === category);
    return filtered.length ? filtered : tax.propertyTypes;
  }, [category, tax.propertyTypes]);

  const activeTypeId = propertyTypeId || initial?.propertyTypeId || typeOptions[0]?.id || "";
  const activeType = tax.propertyTypes.find((type) => type.id === activeTypeId) ?? typeOptions[0];
  const activeTypeName = activeType?.name ?? "Property";
  const isHouse = /villa|house/i.test(activeTypeName);
  const isPlot = /plot|land|sco/i.test(activeTypeName);
  const isCommercial = category === "COMMERCIAL";

  const cityOptions = useMemo(() => {
    return Array.from(new Set([...CITY_OPTIONS, ...tax.locations.map((l) => l.city), initial?.city].filter(Boolean) as string[]));
  }, [initial?.city, tax.locations]);

  const subLocations = selectedCity ? CITY_SUB_LOCATIONS[selectedCity] ?? [] : [];
  const savedCityLocationId = tax.locations.find((location) => location.city.toLowerCase() === selectedCity.toLowerCase())?.id ?? "";
  const selectedSubLocation = subLocation === "Other" ? otherLocation.trim() : subLocation;
  const coverId = useMemo(() => images.find((image) => image.isCover)?.id, [images]);
  const generatedTitle = useMemo(() => {
    const bhkText = bhk ? `${bhk} BHK ` : "";
    const place = [selectedSubLocation, selectedCity].filter(Boolean).join(", ");
    return `${bhkText}${activeTypeName}${place ? ` in ${place}` : ""}`.trim();
  }, [activeTypeName, bhk, selectedCity, selectedSubLocation]);

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
    setError("");
    const allowed = Math.max(0, MAX_IMAGES - images.length);
    const incoming = Array.from(files).slice(0, allowed);
    if (incoming.length < files.length) setError(`Only ${MAX_IMAGES} photos can be added.`);
    const selected = incoming.map((file, index) => ({
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

  function reorderImage(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    setImages((current) => {
      const sourceIndex = current.findIndex((image) => image.id === sourceId);
      const targetIndex = current.findIndex((image) => image.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = current.slice();
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return normalize(next);
    });
  }

  function setCover(id: string) {
    setImages((current) => current.map((image) => ({ ...image, isCover: image.id === id })));
  }

  function handleCategory(nextCategory: string) {
    setCategory(nextCategory);
    const nextType = tax.propertyTypes.find((type) => type.category === nextCategory);
    setPropertyTypeId(nextType?.id ?? "");
  }

  function handleCity(nextCity: string) {
    setSelectedCity(nextCity);
    setSubLocation("");
    setOtherLocation("");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (images.length < MIN_IMAGES) {
      setStep(7);
      setError(`Upload at least ${MIN_IMAGES} photos before saving.`);
      return;
    }
    if (images.length > MAX_IMAGES) {
      setStep(7);
      setError(`A property can have at most ${MAX_IMAGES} photos.`);
      return;
    }
    const cleanSubLocation = subLocation === "Other" ? otherLocation.trim() : subLocation;
    if (!selectedCity) {
      setStep(2);
      setError("Please select a city.");
      return;
    }
    if (!cleanSubLocation) {
      setStep(2);
      setError("Please select a sector or sub-location.");
      return;
    }
    if (!savedCityLocationId) {
      setStep(2);
      setError(`Location taxonomy is missing for ${selectedCity}. Add ${selectedCity} in Admin Taxonomies first.`);
      return;
    }

    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") || generatedTitle || initial?.title || "").trim();
    const description = String(fd.get("description") || "").trim();
    const selectedSuperArea = numberOrNull(fd.get("superArea")) ?? numberOrNull(fd.get("area")) ?? 0;
    const features = String(fd.get("features") || "")
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

    const payload = {
      title,
      description,
      category,
      propertyTypeId: fd.get("propertyTypeId") || activeTypeId,
      transactionType: fd.get("transactionType"),
      status: "PUBLISHED",
      featured: fd.get("featured") === "on",
      price: Number(fd.get("price")),
      priceMax: null,
      negotiable: fd.get("priceTag") !== "FIXED",
      listingType,
      sellerName: listingType === "RESALE" ? textOrNull(fd.get("sellerName")) : null,
      sellerPhone: listingType === "RESALE" ? textOrNull(fd.get("sellerPhone")) : null,
      bhk: numberOrNull(fd.get("bhk")),
      locality: cleanSubLocation,
      sector: cleanSubLocation,
      projectName: null,
      locationId: savedCityLocationId,
      city: selectedCity,
      postalCode: null,
      latitude: null,
      longitude: null,
      area: selectedSuperArea,
      superArea: selectedSuperArea,
      areaUnit: fd.get("areaUnit") || "sq.ft.",
      builtUpArea: numberOrNull(fd.get("builtUpArea")),
      carpetArea: numberOrNull(fd.get("carpetArea")),
      otherRooms: fd.getAll("otherRooms").map(String).join(","),
      bedrooms: numberOrNull(fd.get("bedrooms")),
      bathrooms: numberOrNull(fd.get("bathrooms")),
      balconies: numberOrNull(fd.get("balconies")),
      floor: numberOrNull(fd.get("floor")),
      floorLabel: textOrNull(fd.get("floorLabel")),
      totalFloors: numberOrNull(fd.get("totalFloors")),
      facing: textOrNull(fd.get("facing")),
      parking: Number(fd.get("coveredParking") || 0) > 0 || Number(fd.get("openParking") || 0) > 0,
      coveredParking: numberOrNull(fd.get("coveredParking")),
      openParking: numberOrNull(fd.get("openParking")),
      plotLength: numberOrNull(fd.get("plotLength")),
      plotBreadth: numberOrNull(fd.get("plotBreadth")),
      floorsAllowed: numberOrNull(fd.get("floorsAllowed")),
      boundaryWall: fd.get("boundaryWall") ? fd.get("boundaryWall") === "YES" : null,
      openSides: numberOrNull(fd.get("openSides")),
      constructionDone: fd.get("constructionDone") ? fd.get("constructionDone") === "YES" : null,
      furnishing,
      furnishingItems: fd.getAll("furnishingItems").map(String).join(","),
      possession,
      possessionDate: textOrNull(fd.get("possessionDate")),
      propertyAge: textOrNull(fd.get("propertyAge")),
      reraNumber: null,
      tagline: null,
      commercialSubtype: textOrNull(fd.get("commercialSubtype")),
      locatedInside: textOrNull(fd.get("locatedInside")),
      washroomType: textOrNull(fd.get("washroomType")),
      parkingType: textOrNull(fd.get("parkingType")),
      entranceWidth: numberOrNull(fd.get("entranceWidth")),
      ceilingHeight: numberOrNull(fd.get("ceilingHeight")),
      builderId: null,
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

  async function requestDelete(e: FormEvent<HTMLFormElement>) {
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

  const selectedOtherRooms = splitList(initial?.otherRooms);
  const selectedFurnishingItems = splitList(initial?.furnishingItems);
  const percent = Math.round(((step + 1) / steps.length) * 100);

  return (
    <>
      <form onSubmit={onSubmit} noValidate className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit max-h-[calc(100dvh-11rem)] overflow-y-auto rounded-lg border border-line bg-white p-4">
          <p className="text-sm font-semibold text-navy">Create property</p>
          <div className="mt-4 h-2 rounded-full bg-page">
            <div className="h-2 rounded-full bg-navy" style={{ width: `${percent}%` }} />
          </div>
          <ol className="mt-5 grid gap-1.5 text-sm">
            {steps.map((label, index) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => setStep(index)}
                  className={`flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-left transition ${
                    index === step ? "bg-navy text-white" : index < step ? "bg-page text-navy" : "text-ink-soft"
                  }`}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs">{index + 1}</span>
                  <span className="truncate">{label}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <div className="grid min-w-0 gap-5">
          <div className={step === 0 ? "grid gap-5" : "hidden"}>
            <Section title="Property listing type">
              <RadioGroup
                name="listingTypeControl"
                value={listingType}
                onChange={setListingType}
                options={[
                  ["RESALE", "Resale"],
                  ["FRESH", "Fresh/New Property"],
                ]}
              />
              {listingType === "RESALE" && (
                <div className="grid gap-3 md:grid-cols-2">
                  <input name="sellerName" defaultValue={initial?.sellerName ?? ""} placeholder="Seller name" />
                  <input name="sellerPhone" defaultValue={initial?.sellerPhone ?? ""} placeholder="Seller contact number" />
                </div>
              )}
              <select name="transactionType" defaultValue={initial?.transactionType ?? "BUY"}>
                <option value="BUY">Buy</option>
                <option value="RENT">Rent / Lease</option>
                <option value="INVEST">Invest</option>
              </select>
            </Section>
          </div>

          <div className={step === 1 ? "grid gap-5" : "hidden"}>
            <Section title="Property category">
              <RadioGroup
                name="categoryControl"
                value={category}
                onChange={handleCategory}
                options={[
                  ["RESIDENTIAL", "Residential"],
                  ["COMMERCIAL", "Commercial"],
                ]}
              />
              <select name="propertyTypeId" value={activeTypeId} onChange={(e) => setPropertyTypeId(e.target.value)} required>
                {typeOptions.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {isCommercial && (
                <p className="text-sm text-ink-soft">
                  Commercial is enabled with basic shop/showroom/office details. Deeper commercial-only fields can be expanded after this residential workflow is approved.
                </p>
              )}
            </Section>
          </div>

          <div className={step === 2 ? "grid gap-5" : "hidden"}>
            <Section title="Property location">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="City">
                  <select name="city" value={selectedCity} onChange={(e) => handleCity(e.target.value)} required>
                    <option value="">Select city</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Sector / sub-location">
                  <select
                    name="subLocation"
                    value={subLocation}
                    onChange={(e) => {
                      setSubLocation(e.target.value);
                      if (e.target.value !== "Other") setOtherLocation("");
                    }}
                    disabled={!selectedCity}
                    required
                  >
                    <option value="">{selectedCity ? "Select sector / sub-location" : "Select city first"}</option>
                    {subLocations.map((location) => (
                      <option key={location.value} value={location.value}>
                        {location.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {subLocation === "Other" && (
                <input value={otherLocation} onChange={(e) => setOtherLocation(e.target.value)} placeholder="Other location / locality" />
              )}
            </Section>
          </div>

          <div className={step === 3 ? "grid gap-5" : "hidden"}>
            <Section title={isCommercial ? "Commercial configuration" : "Property configuration"}>
              {!isCommercial && !isPlot && (
                <div className="grid gap-3 md:grid-cols-4">
                  <SelectNumber name="bhk" label="BHK" min={1} max={10} defaultValue={initial?.bhk ?? initial?.bedrooms ?? undefined} onChange={setBhk} />
                  <SelectNumber name="bedrooms" label="Bedrooms" min={1} max={10} defaultValue={initial?.bedrooms ?? undefined} />
                  <SelectNumber name="bathrooms" label="Bathrooms" min={0} max={10} defaultValue={initial?.bathrooms ?? undefined} />
                  <SelectNumber name="balconies" label="Balconies" min={0} max={10} defaultValue={initial?.balconies ?? undefined} />
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  name="superArea"
                  type="number"
                  min="1"
                  required
                  defaultValue={initial?.superArea ?? initial?.area ?? undefined}
                  onChange={(e) => setSuperArea(Number(e.target.value))}
                  placeholder={isPlot ? "Plot area" : "Super area"}
                />
                <select name="areaUnit" value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)}>
                  {areaUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <input name="carpetArea" type="number" min="1" defaultValue={initial?.carpetArea ?? undefined} placeholder="Carpet area (optional)" />
                {!isPlot && (
                  <input name="builtUpArea" type="number" min="1" defaultValue={initial?.builtUpArea ?? undefined} placeholder="Built-up area (optional)" />
                )}
              </div>
              {!isCommercial && !isPlot && (
                <CheckboxGroup name="otherRooms" options={otherRooms} selected={selectedOtherRooms} />
              )}
              {isCommercial && (
                <div className="grid gap-3">
                  <select name="commercialSubtype" defaultValue={initial?.commercialSubtype ?? ""}>
                    <option value="">Commercial subtype</option>
                    <option value="Commercial Shops">Commercial Shops</option>
                    <option value="Commercial Showrooms">Commercial Showrooms</option>
                  </select>
                  <select name="locatedInside" defaultValue={initial?.locatedInside ?? ""}>
                    <option value="">Located inside</option>
                    <option value="Mall">Mall</option>
                    <option value="Commercial Project">Commercial Project</option>
                    <option value="Residential Project">Residential Project</option>
                    <option value="Retail Complex/Building">Retail Complex/Building</option>
                    <option value="Market / High Street">Market / High Street</option>
                    <option value="Others">Others</option>
                  </select>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input name="entranceWidth" type="number" min="0" defaultValue={initial?.entranceWidth ?? undefined} placeholder="Entrance width (ft.)" />
                    <input name="ceilingHeight" type="number" min="0" defaultValue={initial?.ceilingHeight ?? undefined} placeholder="Ceiling height (ft.)" />
                  </div>
                </div>
              )}
              {isPlot && (
                <div className="grid gap-3 md:grid-cols-2">
                  <input name="plotLength" type="number" min="0" defaultValue={initial?.plotLength ?? undefined} placeholder="Length of plot (ft.)" />
                  <input name="plotBreadth" type="number" min="0" defaultValue={initial?.plotBreadth ?? undefined} placeholder="Breadth of plot (ft.)" />
                  <input name="floorsAllowed" type="number" min="0" defaultValue={initial?.floorsAllowed ?? undefined} placeholder="Floors allowed for construction" />
                  <select name="openSides" defaultValue={initial?.openSides ?? ""}>
                    <option value="">No. of open sides</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">3+</option>
                  </select>
                  <select name="boundaryWall" defaultValue={initial?.boundaryWall == null ? "" : initial.boundaryWall ? "YES" : "NO"}>
                    <option value="">Boundary wall?</option>
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                  </select>
                  <select name="constructionDone" defaultValue={initial?.constructionDone == null ? "" : initial.constructionDone ? "YES" : "NO"}>
                    <option value="">Any construction done?</option>
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                  </select>
                </div>
              )}
            </Section>
          </div>

          <div className={step === 4 ? "grid gap-5" : "hidden"}>
            <Section title="Furnishing and amenities">
              <RadioGroup
                name="furnishingControl"
                value={furnishing}
                onChange={setFurnishing}
                options={[
                  ["FURNISHED", "Fully Furnished"],
                  ["SEMI_FURNISHED", "Semi-Furnished"],
                  ["UNFURNISHED", "Unfurnished"],
                ]}
              />
              {furnishing !== "UNFURNISHED" && (
                <CheckboxGroup name="furnishingItems" options={furnishingItems} selected={selectedFurnishingItems} />
              )}
              <fieldset className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {tax.amenities.map((amenity) => (
                  <AmenityCheckbox
                    key={amenity.id}
                    id={amenity.id}
                    name={amenity.name}
                    defaultChecked={initial?.amenities?.some((x) => (x.amenityId || x.amenity?.id) === amenity.id)}
                  />
                ))}
              </fieldset>
              <textarea
                name="features"
                rows={4}
                defaultValue={initial?.features?.map((feature) => feature.label).join("\n")}
                placeholder="Additional features, one per line"
              />
            </Section>
          </div>

          <div className={step === 5 ? "grid gap-5" : "hidden"}>
            <Section title="Floor details">
              <div className="grid gap-3 md:grid-cols-3">
                <select name="totalFloors" defaultValue={initial?.totalFloors ?? ""}>
                  <option value="">Total floors</option>
                  {totalFloorOptions.map((floor) => (
                    <option key={floor} value={floor}>
                      {floor === 0 ? "Ground only" : floor}
                    </option>
                  ))}
                </select>
                {isHouse ? (
                  <select name="floorLabel" defaultValue={initial?.floorLabel ?? ""}>
                    <option value="">Property floor</option>
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="Ground + 1">Ground + 1</option>
                    <option value="Ground + 2">Ground + 2</option>
                    <option value="Ground + 3">Ground + 3</option>
                  </select>
                ) : (
                  <select name="floor" defaultValue={initial?.floor ?? ""}>
                    <option value="">Property on floor</option>
                    {propertyFloorOptions.map((floor) => (
                      <option key={floor.value} value={floor.value}>
                        {floor.label}
                      </option>
                    ))}
                  </select>
                )}
                <select name="facing" defaultValue={initial?.facing ?? ""}>
                  <option value="">Facing</option>
                  {facingOptions.map((facing) => (
                    <option key={facing} value={facing}>
                      {facing}
                    </option>
                  ))}
                </select>
                <select name="coveredParking" defaultValue={initial?.coveredParking ?? ""}>
                  <option value="">Covered parking</option>
                  {parkingCountOptions.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
                <select name="openParking" defaultValue={initial?.openParking ?? ""}>
                  <option value="">Open parking</option>
                  {parkingCountOptions.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>
              {isHouse && (
                <div className="grid gap-3 md:grid-cols-2">
                  <input name="plotLength" type="number" min="0" defaultValue={initial?.plotLength ?? undefined} placeholder="Plot length (ft.)" />
                  <input name="plotBreadth" type="number" min="0" defaultValue={initial?.plotBreadth ?? undefined} placeholder="Plot breadth (ft.)" />
                </div>
              )}
              {isCommercial && (
                <div className="grid gap-3 md:grid-cols-2">
                  <select name="washroomType" defaultValue={initial?.washroomType ?? ""}>
                    <option value="">Washroom details</option>
                    <option value="Private washrooms">Private washrooms</option>
                    <option value="Public washrooms">Public washrooms</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                  <select name="parkingType" defaultValue={initial?.parkingType ?? ""}>
                    <option value="">Parking type</option>
                    <option value="Private Parking">Private Parking</option>
                    <option value="Public Parking">Public Parking</option>
                    <option value="Multilevel Parking">Multilevel Parking</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
              )}
            </Section>
          </div>

          <div className={step === 6 ? "grid gap-5" : "hidden"}>
            <Section title="Property status">
              <RadioGroup
                name="possessionControl"
                value={possession}
                onChange={setPossession}
                options={[
                  ["READY", "Ready to Move"],
                  ["UNDER_CONSTRUCTION", "Under Construction"],
                ]}
              />
              {possession === "READY" ? (
                <Field label="Age of property">
                  <select name="propertyAge" defaultValue={initial?.propertyAge ?? ""}>
                    <option value="">Select property age</option>
                    {propertyAgeOptions.map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </select>
                </Field>
              ) : (
                <Field label="Possession by">
                  <select name="possessionDate" defaultValue={initial?.possessionDate ?? ""}>
                    <option value="">Expected completion</option>
                    {completionOptions.map((completion) => (
                      <option key={completion} value={completion}>
                        {completion}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </Section>
          </div>

          <div className={step === 7 ? "grid gap-5" : "hidden"}>
            <Section title="Property photos">
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => addImages(e.target.files)} />
              <p className="text-sm text-ink-soft">
                {images.length}/{MAX_IMAGES} uploaded. Minimum {MIN_IMAGES} photos required.
              </p>
              {images.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      draggable
                      onDragStart={() => setDragId(image.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (dragId) reorderImage(dragId, image.id);
                        setDragId(null);
                      }}
                      className="overflow-hidden rounded-lg border border-line bg-white"
                    >
                      <img src={image.url} alt="" className="h-40 w-full object-cover" />
                      <div className="grid gap-2 p-3 text-sm">
                        <label className="flex items-center gap-2">
                          <input type="radio" checked={coverId === image.id} onChange={() => setCover(image.id)} />
                          Cover image
                        </label>
                        <button type="button" className="text-left text-red-700 underline" onClick={() => removeImage(image.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          <div className={step === 8 ? "grid gap-5" : "hidden"}>
            <Section title="Price">
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  name="price"
                  type="number"
                  min="1"
                  required
                  defaultValue={initial?.price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="Property price"
                  className="h-12 min-h-0 px-4 py-0"
                />
                <input
                  readOnly
                  value={moneyPerArea(price, superArea) ? `${moneyPerArea(price, superArea)} / ${areaUnit}` : ""}
                  placeholder={`Price / ${areaUnit}`}
                  className="h-12 min-h-0 bg-page px-4 py-0"
                />
                <select name="priceTag" defaultValue={initial?.negotiable === false ? "FIXED" : "NEGOTIABLE"} className="h-12 min-h-0 px-4 py-0">
                  <option value="NEGOTIABLE">Negotiable</option>
                  <option value="FIXED">Fixed</option>
                </select>
              </div>
              <p className="text-sm text-ink-soft">
                Price per {areaUnit}: {moneyPerArea(price, superArea) || "Enter price and area"}
              </p>
            </Section>
          </div>

          <div className={step === 9 ? "grid gap-5" : "hidden"}>
            <Section title="Property name and description">
              <input name="title" readOnly value={generatedTitle || initial?.title || ""} />
              <textarea name="description" required rows={6} defaultValue={initial?.description} placeholder="Property description" />
            </Section>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" disabled={step === 0 || busy} onClick={() => setStep((current) => Math.max(0, current - 1))}>
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button type="button" disabled={busy} onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={busy || images.length < MIN_IMAGES}>
                {busy ? (editing ? "Updating property..." : "Creating property...") : editing ? "Save changes" : "Create property"}
              </Button>
            )}
            {busy && <p className="text-sm text-ink-soft">Uploading images and saving property...</p>}
            {success && <p className="text-sm text-green-700">{success}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 rounded-lg border border-line bg-white p-5 lg:p-6">
      <h2 className="text-base font-semibold text-navy">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-navy">
      <span>{label}</span>
      {children}
    </label>
  );
}

function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([optionValue, label]) => (
        <button
          type="button"
          key={optionValue}
          onClick={() => onChange(optionValue)}
          className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-sm font-medium leading-none transition ${
            value === optionValue ? "border-navy bg-navy text-white shadow-sm" : "border-line bg-white text-navy hover:border-navy/30"
          }`}
        >
          {label}
        </button>
      ))}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}

function CheckboxGroup({ name, options, selected }: { name: string; options: string[]; selected: string[] }) {
  return (
    <fieldset className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {options.map((option) => (
        <label key={option} className="flex items-center gap-2 text-sm">
          <input type="checkbox" name={name} value={option} defaultChecked={selected.includes(option)} />
          {option}
        </label>
      ))}
    </fieldset>
  );
}

function AmenityCheckbox({ id, name, defaultChecked }: { id: string; name: string; defaultChecked?: boolean }) {
  const Icon = iconForAmenity(name);
  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm transition hover:border-navy/25">
      <input type="checkbox" name="amenityIds" value={id} defaultChecked={defaultChecked} className="shrink-0" />
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-page text-navy">
        <Icon size={18} strokeWidth={1.9} />
      </span>
      <span className="leading-tight">{name}</span>
    </label>
  );
}

function iconForAmenity(name: string): LucideIcon {
  const value = name.toLowerCase();
  if (value.includes("pool") || value.includes("swim")) return Waves;
  if (value.includes("gym") || value.includes("fitness")) return Dumbbell;
  if (value.includes("park") || value.includes("garden")) return Trees;
  if (value.includes("parking") || value.includes("car")) return Car;
  if (value.includes("air") || value.includes("ac")) return Snowflake;
  if (value.includes("bath") || value.includes("wash") || value.includes("geyser")) return Bath;
  if (value.includes("security")) return ShieldCheck;
  if (value.includes("power") || value.includes("backup")) return Zap;
  if (value.includes("club") || value.includes("servant")) return Home;
  if (value.includes("kitchen") || value.includes("modular")) return Sparkles;
  return Building2;
}

function SelectNumber({
  name,
  label,
  min,
  max,
  defaultValue,
  onChange,
}: {
  name: string;
  label: string;
  min: number;
  max: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
}) {
  return (
    <select name={name} defaultValue={defaultValue ?? ""} onChange={(e) => onChange?.(Number(e.target.value) || 0)}>
      <option value="">{label}</option>
      {Array.from({ length: max - min + 1 }, (_, index) => min + index).map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </select>
  );
}
