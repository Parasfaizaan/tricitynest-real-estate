import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!(await rateLimit(`news:${ip}`, 6, 60_000))) return jsonError("Too many requests.", 429);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Enter a valid email.");
  await prisma.newsletter.upsert({
    where: { email: parsed.data.email.toLowerCase() },
    update: {},
    create: { email: parsed.data.email.toLowerCase() },
  });
  return Response.json({ ok: true });
}
