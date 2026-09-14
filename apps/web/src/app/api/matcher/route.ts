import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";
import { matchProperties } from "@/lib/matching";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { serializeProperty } from "@/lib/property-query";
import { grantPriceAccess } from "@/lib/price-access";
import { TransactionType } from "@prisma/client";

const phoneRegex = /^(?:\+91[\s-]?|91[\s-]?|0)?[6-9]\d{9}$/;

const schema = z.object({
  propertyTypes: z.array(z.string()).min(1, "Select at least one property type"),
  transactionType: z.enum(["BUY", "RENT", "INVEST"]),
  locationSlugs: z.array(z.string()).min(1, "Select at least one location"),
  minBudget: z.number().nullable().optional(),
  maxBudget: z.number().nullable().optional(),
  bedrooms: z.array(z.number()).optional(),
  minArea: z.number().nullable().optional(),
  maxArea: z.number().nullable().optional(),
  timeline: z.string().nullable().optional(),
  name: z.string().min(2),
  phone: z.string().regex(phoneRegex, "Enter a valid Indian mobile number"),
  email: z.string().email(),
  whatsapp: z.string().optional(),
  consent: z.boolean(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!(await rateLimit(`matcher:${ip}`, 8, 60_000))) {
    return jsonError("Too many submissions. Please wait a moment.", 429);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid form data");
  }
  if (!parsed.data.consent) return jsonError("Consent is required to send matches.");

  const types = await prisma.propertyType.findMany({
    where: { slug: { in: parsed.data.propertyTypes } },
  });
  const categories = [...new Set(types.map((t) => t.category))].join(",");

  const email = parsed.data.email.toLowerCase();
  const phone = parsed.data.phone.replace(/[\s-]/g, "");
  const preference = {
    categories,
    propertyTypes: parsed.data.propertyTypes.join(","),
    transactionType: parsed.data.transactionType as TransactionType,
    locationSlugs: parsed.data.locationSlugs.join(","),
    minBudget: parsed.data.minBudget ?? null,
    maxBudget: parsed.data.maxBudget ?? null,
    bedrooms: parsed.data.bedrooms?.join(",") ?? null,
    minArea: parsed.data.minArea ?? null,
    maxArea: parsed.data.maxArea ?? null,
    timeline: parsed.data.timeline ?? null,
  };
  const existing = await prisma.lead.findFirst({
    where: { OR: [{ email }, { phone }] },
    include: { preference: true },
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
          source: "MATCHER",
          preference: existing.preference
            ? { update: preference }
            : { create: preference },
        },
      })
    : await prisma.lead.create({
        data: {
          name: parsed.data.name,
          phone,
          email,
          whatsapp: parsed.data.whatsapp || phone,
          consent: parsed.data.consent,
          source: "MATCHER",
          preference: { create: preference },
        },
      });

  const matches = await matchProperties(parsed.data);
  await prisma.propertyMatch.deleteMany({ where: { leadId: lead.id } });
  if (matches.length) {
    await prisma.propertyMatch.createMany({
      data: matches.map((m) => ({
        leadId: lead.id,
        propertyId: m.id,
        score: m.score,
      })),
    });
  }
  await grantPriceAccess(lead.id);

  return Response.json({
    leadId: lead.id,
    matches: matches.map((m) => ({ ...serializeProperty(m, true), score: m.score })),
  }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
