"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DeletionReview({ id }: { id: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  async function decide(decision: "APPROVED" | "REJECTED") {
    setError("");
    const res = await fetch(`/api/super-admin/deletions/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, reviewNotes: notes }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-4 grid gap-2">
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Review notes (required to reject)" rows={2} />
      <div className="flex gap-2">
        <Button type="button" onClick={() => decide("APPROVED")}>
          Approve
        </Button>
        <Button type="button" variant="outline" onClick={() => decide("REJECTED")}>
          Reject
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
