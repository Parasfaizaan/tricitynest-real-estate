"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [status, setStatus] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        topic: fd.get("topic"),
        message: fd.get("message"),
      }),
    });
    setStatus(res.ok ? "Message sent." : "Could not send.");
    if (res.ok) e.currentTarget.reset();
  }
  return (
    <form onSubmit={onSubmit} className="card-surface grid gap-3 p-6">
      <input name="name" required placeholder="Name" />
      <input name="email" type="email" required placeholder="Email" />
      <input name="phone" placeholder="Phone" />
      <input name="topic" placeholder="Topic" />
      <textarea name="message" required rows={5} placeholder="Message" />
      <Button type="submit">Send</Button>
      {status && <p className="text-sm text-ink-soft">{status}</p>}
    </form>
  );
}
