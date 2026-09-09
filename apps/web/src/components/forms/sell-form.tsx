"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SellForm() {
  const [status, setStatus] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        city: fd.get("city"),
        propertyType: fd.get("propertyType"),
        expectedPrice: fd.get("expectedPrice") ? Number(fd.get("expectedPrice")) : undefined,
        message: fd.get("message"),
      }),
    });
    setStatus(res.ok ? "Valuation request received." : "Could not send.");
    if (res.ok) e.currentTarget.reset();
  }
  return (
    <form onSubmit={onSubmit} className="card-surface grid gap-3 p-6">
      <input name="name" required placeholder="Name" />
      <input name="phone" required placeholder="Phone" />
      <input name="email" type="email" placeholder="Email" />
      <input name="city" placeholder="City" />
      <input name="propertyType" placeholder="Property type" />
      <input name="expectedPrice" type="number" placeholder="Expected price" />
      <textarea name="message" rows={4} placeholder="Notes" />
      <Button type="submit">Request valuation</Button>
      {status && <p className="text-sm text-ink-soft">{status}</p>}
    </form>
  );
}
