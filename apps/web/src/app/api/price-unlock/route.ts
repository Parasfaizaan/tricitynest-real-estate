import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { grantPriceAccess } from "@/lib/price-access";

const phoneRegex = /^(?:\+91[\s-]?|91[\s-]?|0)?[6-9]\d{9}$/;

const schema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid Indian mobile number"),
  email: z.string().trim().email("Enter a valid email address"),
  whatsapp: z.string().trim().optional(),
  consent: z.boolean().refine((value) => value === true, "Please agree to be contacted for price access."),
  propertyId: z.string().optional(),
  propertySlug: z.string().optional(),
  propertyTitle: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!(await rateLimit(`price-unlock:${ip}`, 8, 60_000))) {
    return jsonError("Too many requests. Please wait a moment.", 429);
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Please complete the form.");
  }

  const email = parsed.data.email.toLowerCase();
  const phone = parsed.data.phone.replace(/[\s-]/g, "");
  const existing = await prisma.lead.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
    orderBy: { updatedAt: "desc" },
  });

  const lead = existing
    ? await prisma.lead.update({
        where: { id: existing.id },
        data: {
          name: parsed.data.name,
          phone,
          email,
          whatsapp: parsed.data.whatsapp || phone,
          consent: parsed.data.consent,
          source: "PRICE_UNLOCK",
        },
      })
    : await prisma.lead.create({
        data: {
          name: parsed.data.name,
          phone,
          email,
          whatsapp: parsed.data.whatsapp || phone,
          consent: parsed.data.consent,
          source: "PRICE_UNLOCK",
        },
      });

  if (parsed.data.propertyId || parsed.data.propertySlug || parsed.data.propertyTitle) {
    await prisma.leadNote.create({
      data: {
        leadId: lead.id,
        body: JSON.stringify({
          source: "PRICE_UNLOCK",
          propertyId: parsed.data.propertyId,
          propertySlug: parsed.data.propertySlug,
          propertyTitle: parsed.data.propertyTitle,
        }),
      },
    });
  }

  await grantPriceAccess(lead.id);
  return Response.json({ ok: true });
}
