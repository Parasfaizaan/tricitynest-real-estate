import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import { prisma } from "./prisma";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  profilePhotoUrl?: string | null;
  socialLinks?: string | null;
};

const COOKIE = "tn_session";

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "tricitynest-demo-secret-change-in-production-32b");
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function readSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.id || !payload.email || !payload.role) return null;
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name ?? ""),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function requireUser() {
  const session = await readSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || !user.active) return null;
  return {
    ...session,
    role: user.role,
    name: user.name,
    phone: user.phone,
    profilePhotoUrl: user.profilePhotoUrl,
    socialLinks: user.socialLinks,
  };
}

export function isStaff(role: Role) {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

export function isSuper(role: Role) {
  return role === Role.SUPER_ADMIN;
}
