import { requireUser, isStaff, isSuper } from "./auth";
import { jsonError } from "./utils";
import type { Role } from "@prisma/client";

export async function requireStaff() {
  const user = await requireUser();
  if (!user || !isStaff(user.role)) return null;
  return user;
}

export async function requireSuper() {
  const user = await requireUser();
  if (!user || !isSuper(user.role)) return null;
  return user;
}

export function unauthorized() {
  return jsonError("Unauthorized", 401);
}

export function forbidden() {
  return jsonError("Forbidden", 403);
}

export function staffOrFail(user: { role: Role } | null) {
  if (!user) return unauthorized();
  return null;
}
