import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

const STATE_COOKIE = "tn_google_oauth_state";
const NEXT_COOKIE = "tn_google_oauth_next";

type GoogleUser = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

function appUrl(req: Request) {
  return process.env.AUTH_URL || new URL(req.url).origin;
}

function redirectWithError(req: Request, error: string) {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, appUrl(req)));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const savedState = jar.get(STATE_COOKIE)?.value;
  const next = jar.get(NEXT_COOKIE)?.value || "/";
  jar.delete(STATE_COOKIE);
  jar.delete(NEXT_COOKIE);

  if (!code || !state || !savedState || state !== savedState) return redirectWithError(req, "google_state_invalid");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return redirectWithError(req, "google_not_configured");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${appUrl(req)}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return redirectWithError(req, "google_token_failed");
  const token = await tokenRes.json();
  if (!token.access_token) return redirectWithError(req, "google_token_missing");

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!userRes.ok) return redirectWithError(req, "google_profile_failed");
  const googleUser = (await userRes.json()) as GoogleUser;
  if (!googleUser.email || !googleUser.email_verified) return redirectWithError(req, "google_email_unverified");

  const email = googleUser.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.role !== Role.USER) return redirectWithError(req, "staff_google_login_disabled");
  if (existing && !existing.active) return redirectWithError(req, "account_disabled");

  const user =
    existing ??
    (await prisma.user.create({
      data: {
        email,
        name: googleUser.name || email.split("@")[0],
        passwordHash: bcrypt.hashSync(`google:${googleUser.sub}:${randomUUID()}`, 10),
        profilePhotoUrl: googleUser.picture || null,
        role: Role.USER,
      },
    }));

  const session = await createSessionToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(session);
  await writeAudit({
    actorId: user.id,
    action: existing ? "GOOGLE_LOGIN" : "GOOGLE_USER_CREATED",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email },
  });

  const destination = user.phone ? next : `/profile?next=${encodeURIComponent(next.startsWith("/") ? next : "/")}`;
  return NextResponse.redirect(new URL(destination, appUrl(req)));
}
