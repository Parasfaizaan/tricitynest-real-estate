"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function TaxonomyForm() {
  const router = useRouter();
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/admin/taxonomies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: fd.get("kind"),
        name: fd.get("name"),
        category: fd.get("category"),
        city: fd.get("city"),
      }),
    });
    e.currentTarget.reset();
    router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="mt-8 grid max-w-lg gap-3 card-surface p-5">
      <p className="font-medium">Add</p>
      <select name="kind" required>
        <option value="location">Location</option>
        <option value="type">Property type</option>
        <option value="amenity">Amenity</option>
      </select>
      <input name="name" required placeholder="Name" />
      <input name="city" placeholder="City (locations)" />
      <select name="category">
        <option value="RESIDENTIAL">Residential</option>
        <option value="COMMERCIAL">Commercial</option>
      </select>
      <Button type="submit">Add</Button>
    </form>
  );
}
