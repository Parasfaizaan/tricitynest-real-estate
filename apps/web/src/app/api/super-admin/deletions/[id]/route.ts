import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuper, unauthorized } from "@/lib/admin-guard";
import { jsonError } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";
import { DeletionRequestStatus, PropertyStatus } from "@prisma/client";

const schema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  reviewNotes: z.string().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireSuper();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid decision");
  if (parsed.data.decision === "REJECTED" && !parsed.data.reviewNotes) {
    return jsonError("A rejection note is required.");
  }

  const request = await prisma.propertyDeletionRequest.findUnique({ where: { id } });
  if (!request || request.status !== DeletionRequestStatus.PENDING) {
    return jsonError("Request not found or already reviewed", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.propertyDeletionRequest.update({
      where: { id },
      data: {
        status: parsed.data.decision as DeletionRequestStatus,
        reviewedById: user.id,
        reviewedAt: new Date(),
        reviewNotes: parsed.data.reviewNotes ?? null,
      },
    });
    if (parsed.data.decision === "APPROVED") {
      await tx.property.update({
        where: { id: request.propertyId },
        data: { deletedAt: new Date(), status: PropertyStatus.ARCHIVED },
      });
    }
  });

  await writeAudit({
    actorId: user.id,
    action: parsed.data.decision === "APPROVED" ? "PROPERTY_DELETION_APPROVED" : "PROPERTY_DELETION_REJECTED",
    entityType: "Property",
    entityId: request.propertyId,
    metadata: { requestId: id, notes: parsed.data.reviewNotes },
  });

  return Response.json({ ok: true });
}
