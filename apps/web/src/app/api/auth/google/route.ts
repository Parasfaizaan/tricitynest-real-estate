import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const STATE_COOKIE = "tn_google_oauth_state";
const NEXT_COOKIE = "tn_google_oauth_next";

function appUrl(req: Request) {
  return process.env.AUTH_URL || new URL(req.url).origin;
}

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return NextResponse.redirect(new URL("/login?error=google_not_configured", appUrl(req)));

  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/";
  const state = randomUUID();
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600, secure: process.env.NODE_ENV === "production" });
  jar.set(NEXT_COOKIE, next.startsWith("/") ? next : "/", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600, secure: process.env.NODE_ENV === "production" });

  const google = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.searchParams.set("client_id", clientId);
  google.searchParams.set("redirect_uri", `${appUrl(req)}/api/auth/google/callback`);
  google.searchParams.set("response_type", "code");
  google.searchParams.set("scope", "openid email profile");
  google.searchParams.set("state", state);
  google.searchParams.set("prompt", "select_account");
  return NextResponse.redirect(google);
}
