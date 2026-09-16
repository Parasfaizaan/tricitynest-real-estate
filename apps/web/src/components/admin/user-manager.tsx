"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
// import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, UserCheck, UserX } from "lucide-react";

type U = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profilePhotoUrl?: string | null;
  socialLinks?: string | null;
  role: string;
  active: boolean;
  createdAt?: string;
};

export function UserManager({
  users,
  currentUserId,
  currentUserRole,
  page,
  pages,
  basePath = "/admin/users",
}: {
  users: U[];
  currentUserId: string;
  currentUserRole: string;
  page: number;
  pages: number;
  basePath?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [confirmAction, setConfirmAction] = useState<
    | { kind: "status"; user: U; nextActive: boolean }
    | { kind: "delete"; user: U }
    | null
  >(null);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/super-admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
        role: "ADMIN",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  async function patch(id: string, body: object) {
    setBusyId(id);
    setError("");
    const res = await fetch(`/api/super-admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusyId("");
    if (!res.ok) {
      setError(data.error || "User update failed");
      return;
    }
    router.refresh();
  }

  async function remove(id: string) {
    setBusyId(id);
    setError("");
    const res = await fetch(`/api/super-admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusyId("");
    if (!res.ok) {
      setError(data.error || "User delete failed");
      return;
    }
    router.refresh();
  }

  async function runConfirmedAction() {
    if (!confirmAction) return;
    const action = confirmAction;
    setConfirmAction(null);
    if (action.kind === "status") {
      await patch(action.user.id, { active: action.nextActive });
      return;
    }
    await remove(action.user.id);
  }

  return (
    <div className="mt-6 grid gap-8">
      <div className="overflow-x-auto card-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Joined</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const protectedUser = u.id === currentUserId || u.role === "SUPER_ADMIN" || (currentUserRole !== "SUPER_ADMIN" && u.role === "ADMIN");
              return (
                <tr key={u.id} className="border-b border-line/70 align-middle">
                  <td className="p-3">
                    <div className="flex min-w-[220px] items-center gap-3">
                      {u.profilePhotoUrl ? (
                        <img src={u.profilePhotoUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ice/40 font-semibold text-navy">
                          {u.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-navy">{u.name}</p>
                        {u.socialLinks && <p className="max-w-xs truncate text-xs text-ink-soft">{u.socialLinks}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-ink-soft">
                    <p>{u.email}</p>
                    {u.phone && <p className="mt-1">Phone: {u.phone}</p>}
                  </td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.active ? "Active" : "Suspended"}</td>
                  <td className="p-3 text-ink-soft">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={protectedUser || busyId === u.id}
                        className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-navy transition hover:border-navy/25 hover:bg-page disabled:text-ink-soft disabled:hover:border-line disabled:hover:bg-white"
                        onClick={() => setConfirmAction({ kind: "status", user: u, nextActive: !u.active })}
                        aria-label={u.active ? "Suspend user" : "Activate user"}
                        title={u.active ? "Suspend" : "Activate"}
                      >
                        {u.active ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <button
                        type="button"
                        disabled={protectedUser || busyId === u.id}
                        className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-red-700 transition hover:border-red-200 hover:bg-red-50 disabled:text-ink-soft disabled:hover:border-line disabled:hover:bg-white"
                        onClick={() => setConfirmAction({ kind: "delete", user: u })}
                        aria-label="Delete user"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`${basePath}?page=${n}`}
              className={`grid h-10 w-10 place-items-center rounded-full text-sm ${n === page ? "bg-navy text-white" : "border border-line bg-white text-navy"}`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}
      {/* {currentUserRole === "SUPER_ADMIN" && (
        <form onSubmit={create} className="card-surface grid max-w-xl gap-3 p-5">
          <p className="font-medium">Create admin</p>
          <input name="name" required placeholder="Name" />
          <input name="email" type="email" required placeholder="Email" />
          <input name="password" required minLength={8} placeholder="Password" />
          <Button type="submit">Create</Button>
        </form>
      )} */}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          busy={busyId === confirmAction.user.id}
          onCancel={() => setConfirmAction(null)}
          onConfirm={runConfirmedAction}
        />
      )}
    </div>
  );
}

function ConfirmModal({
  action,
  busy,
  onCancel,
  onConfirm,
}: {
  action: { kind: "status"; user: U; nextActive: boolean } | { kind: "delete"; user: U };
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isDelete = action.kind === "delete";
  const title = isDelete ? "Delete user?" : action.nextActive ? "Activate user?" : "Suspend user?";
  const message = isDelete
    ? `${action.user.name} will no longer be able to log in with this account.`
    : action.nextActive
      ? `${action.user.name} will be able to log in again.`
      : `${action.user.name} will not be able to log in until reactivated.`;
  const confirmLabel = isDelete ? "Delete" : action.kind === "status" && action.nextActive ? "Activate" : "Suspend";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] grid place-items-center bg-navy/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={busy} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold text-navy disabled:opacity-50">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`min-h-11 rounded-full px-5 text-sm font-semibold text-white disabled:opacity-50 ${isDelete ? "bg-red-700" : "bg-navy"}`}
          >
            {busy ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
