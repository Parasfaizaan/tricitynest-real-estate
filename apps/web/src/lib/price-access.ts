import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { isStaff, readSession } from "./auth";
import { prisma } from "./prisma";

export const PRICE_ACCESS_COOKIE = "tn_price_access";
const ACCESS_DAYS = 30;

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "tricitynest-demo-secret-change-in-production-32b");
}

export async function hasPriceAccess() {
  const session = await readSession();
  if (session && isStaff(session.role)) return true;
  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { active: true },
    });
    if (user?.active) return true;
  }

  const jar = await cookies();
  const token = jar.get(PRICE_ACCESS_COOKIE)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.granted === true;
  } catch {
    return false;
  }
}

export async function grantPriceAccess(leadId?: string) {
  const token = await new SignJWT({ granted: true, ...(leadId ? { leadId } : {}) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_DAYS}d`)
    .sign(secret());

  const jar = await cookies();
  jar.set(PRICE_ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * ACCESS_DAYS,
    secure: process.env.NODE_ENV === "production",
  });
}
