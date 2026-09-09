import { clearSessionCookie, readSession } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

export async function POST() {
  const session = await readSession();
  await clearSessionCookie();
  if (session) {
    await writeAudit({ actorId: session.id, action: "LOGOUT", entityType: "User", entityId: session.id });
  }
  return Response.json({ ok: true });
}
