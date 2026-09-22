import { clearSessionCookie, readSession } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { PRICE_ACCESS_COOKIE } from "@/lib/price-access";

const COOKIE_NAMES = ["tn_session", PRICE_ACCESS_COOKIE, "tn_google_oauth_state", "tn_google_oauth_next"];

export async function POST() {
  const session = await readSession();
  await clearSessionCookie();
  if (session) {
    await writeAudit({ actorId: session.id, action: "LOGOUT", entityType: "User", entityId: session.id });
  }
  const response = Response.json({ ok: true });
  for (const name of COOKIE_NAMES) {
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Max-Age=0; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
    );
  }
  return response;
}
