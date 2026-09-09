import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, unauthorized } from "@/lib/admin-guard";
import { jsonError } from "@/lib/utils";
import { LeadStatus } from "@prisma/client";

const schema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "VISIT_SCHEDULED", "CONVERTED", "CLOSED"]).optional(),
  note: z.string().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid payload");

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return jsonError("Not found", 404);

  if (parsed.data.status) {
    await prisma.lead.update({ where: { id }, data: { status: parsed.data.status as LeadStatus } });
  }
  if (parsed.data.note) {
    await prisma.leadNote.create({
      data: { leadId: id, authorId: user.id, body: parsed.data.note },
    });
  }
  const updated = await prisma.lead.findUnique({
    where: { id },
    include: { preference: true, notes: true, matches: { include: { property: true } } },
  });
  return Response.json({ lead: updated });
}
