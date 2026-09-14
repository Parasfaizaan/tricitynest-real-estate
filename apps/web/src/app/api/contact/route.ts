import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { grantPriceAccess } from "@/lib/price-access";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  topic: z.string().optional(),
  message: z.string().min(8),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!(await rateLimit(`contact:${ip}`, 8, 60_000))) return jsonError("Too many requests.", 429);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please complete the form.");
  const row = await prisma.contactMessage.create({ data: parsed.data });
  await grantPriceAccess();
  return Response.json({ ok: true, id: row.id });
}
