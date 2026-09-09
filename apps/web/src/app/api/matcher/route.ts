import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/utils";
import { matchProperties } from "@/lib/matching";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { serializeProperty } from "@/lib/property-query";
import { TransactionType } from "@prisma/client";

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
  phone: z.string().min(8),
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

  const lead = await prisma.lead.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email.toLowerCase(),
      whatsapp: parsed.data.whatsapp || parsed.data.phone,
      consent: parsed.data.consent,
      preference: {
        create: {
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
        },
      },
    },
  });

  const matches = await matchProperties(parsed.data);
  if (matches.length) {
    await prisma.propertyMatch.createMany({
      data: matches.map((m) => ({
        leadId: lead.id,
        propertyId: m.id,
        score: m.score,
      })),
    });
  }

  return Response.json({
    leadId: lead.id,
    matches: matches.map((m) => ({ ...serializeProperty(m), score: m.score })),
  });
}
