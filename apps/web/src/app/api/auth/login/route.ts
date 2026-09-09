import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { jsonError } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { writeAudit } from "@/lib/audit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!(await rateLimit(`login:${ip}`, 12, 60_000))) {
    return jsonError("Too many attempts. Try again shortly.", 429);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid email or password.");

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !user.active) return jsonError("Invalid email or password.", 401);
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return jsonError("Invalid email or password.", 401);

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await setSessionCookie(token);
  await writeAudit({ actorId: user.id, action: "LOGIN", entityType: "User", entityId: user.id, ip });

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
