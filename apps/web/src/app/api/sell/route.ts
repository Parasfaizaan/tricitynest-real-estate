import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().optional(),
  propertyType: z.string().optional(),
  expectedPrice: z.number().optional(),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!(await rateLimit(`sell:${ip}`, 8, 60_000))) return jsonError("Too many requests.", 429);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please share your name and phone.");
  const row = await prisma.sellLead.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
    },
  });
  return Response.json({ ok: true, id: row.id });
}
