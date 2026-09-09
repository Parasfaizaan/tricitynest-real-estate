"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type U = { id: string; name: string; email: string; role: string; active: boolean };

export function UserManager({ users }: { users: U[] }) {
  const router = useRouter();
  const [error, setError] = useState("");

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
    await fetch(`/api/super-admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-2">
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="card-surface flex items-center justify-between p-4 text-sm">
            <div>
              <p className="font-medium text-navy">{u.name}</p>
              <p className="text-ink-soft">
                {u.email} · {u.role} · {u.active ? "active" : "disabled"}
              </p>
            </div>
            {u.role !== "SUPER_ADMIN" && (
              <button className="underline" onClick={() => patch(u.id, { active: !u.active })}>
                {u.active ? "Disable" : "Enable"}
              </button>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={create} className="card-surface grid gap-3 p-5">
        <p className="font-medium">Create admin</p>
        <input name="name" required placeholder="Name" />
        <input name="email" type="email" required placeholder="Email" />
        <input name="password" required minLength={8} placeholder="Password" />
        <Button type="submit">Create</Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
