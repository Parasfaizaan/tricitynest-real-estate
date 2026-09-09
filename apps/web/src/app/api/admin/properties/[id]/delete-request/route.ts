import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, unauthorized } from "@/lib/admin-guard";
import { jsonError } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";
import { DeletionRequestStatus } from "@prisma/client";

const schema = z.object({
  reason: z.string().min(8, "Please provide a reason"),
  notes: z.string().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const property = await prisma.property.findFirst({ where: { id, deletedAt: null } });
  if (!property) return jsonError("Property not found", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid request");

  const existing = await prisma.propertyDeletionRequest.findFirst({
    where: { propertyId: id, status: DeletionRequestStatus.PENDING },
  });
  if (existing) return jsonError("A deletion request is already pending.");

  const request = await prisma.propertyDeletionRequest.create({
    data: {
      propertyId: id,
      requestedById: user.id,
      reason: parsed.data.reason,
      notes: parsed.data.notes ?? null,
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "PROPERTY_DELETION_REQUESTED",
    entityType: "Property",
    entityId: id,
    metadata: { requestId: request.id, reason: parsed.data.reason },
  });

  return Response.json({ request });
}
