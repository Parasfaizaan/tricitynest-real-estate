import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  propertyId: z.string().optional(),
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!(await rateLimit(`enquiry:${ip}`, 10, 60_000))) {
    return jsonError("Too many requests.", 429);
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please fill name and phone.");

  const enquiry = await prisma.enquiry.create({
    data: {
      propertyId: parsed.data.propertyId || null,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      message: parsed.data.message || null,
    },
  });
  return Response.json({ ok: true, id: enquiry.id });
}
