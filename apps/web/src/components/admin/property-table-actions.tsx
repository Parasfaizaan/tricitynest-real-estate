"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function PropertyTableActions({ id, deletionPending }: { id: string; deletionPending: boolean }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestDelete() {
    setBusy(true);
    setError("");

    const res = await fetch(`/api/admin/properties/${id}/delete-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Admin requested deletion from properties list." }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not request deletion");
      return;
    }
    setConfirmOpen(false);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/properties/${id}`}
        className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-navy transition hover:border-navy/25 hover:bg-page"
        aria-label="Edit property"
        title="Edit"
      >
        <Pencil size={16} />
      </Link>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={deletionPending}
        className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-red-700 transition hover:border-red-200 hover:bg-red-50 disabled:text-ink-soft disabled:hover:border-line disabled:hover:bg-white"
        aria-label={deletionPending ? "Deletion pending" : "Request property deletion"}
        title={deletionPending ? "Deletion pending" : "Delete"}
      >
        <Trash2 size={16} />
      </button>
      {confirmOpen && (
        <DeletePropertyModal
          error={error}
          busy={busy}
          onCancel={() => {
            setConfirmOpen(false);
            setError("");
          }}
          onConfirm={requestDelete}
        />
      )}
    </div>
  );
}

function DeletePropertyModal({
  error,
  busy,
  onCancel,
  onConfirm,
}: {
  error: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] grid place-items-center bg-navy/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
        <h2 className="text-lg font-semibold text-navy">Delete property?</h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">This will send a deletion request to the super admin for review.</p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={busy} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold text-navy disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="min-h-11 rounded-full bg-red-700 px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Please wait..." : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
