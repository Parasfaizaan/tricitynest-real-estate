"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statuses = ["NEW", "CONTACTED", "QUALIFIED", "VISIT_SCHEDULED", "CONVERTED", "CLOSED"];

export function LeadActions({
  id,
  status,
  notes,
}: {
  id: string;
  status: string;
  notes: { id: string; body: string; createdAt: Date }[];
}) {
  const router = useRouter();
  const [note, setNote] = useState("");

  async function update(next: string) {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setNote("");
    router.refresh();
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => update(s)}
            className={`rounded-full px-3 py-1 text-xs ${s === status ? "bg-navy text-white" : "border border-line"}`}
          >
            {s}
          </button>
        ))}
      </div>
      <form onSubmit={addNote} className="mt-3 flex gap-2">
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note" />
        <button className="rounded-full bg-navy px-4 text-sm text-white">Save</button>
      </form>
      <ul className="mt-3 space-y-1 text-xs text-ink-soft">
        {notes.map((n) => (
          <li key={n.id}>{n.body}</li>
        ))}
      </ul>
    </div>
  );
}
