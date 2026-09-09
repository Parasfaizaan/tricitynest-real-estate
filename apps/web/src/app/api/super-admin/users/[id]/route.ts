import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuper, unauthorized } from "@/lib/admin-guard";
import { jsonError } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";
import { Role } from "@prisma/client";

const schema = z.object({
  active: z.boolean().optional(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireSuper();
  if (!actor) return unauthorized();
  const { id } = await ctx.params;
  if (id === actor.id) return jsonError("You cannot change your own account here.");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid payload");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return jsonError("Not found", 404);

  const updated = await prisma.user.update({
    where: { id },
    data: {
      active: parsed.data.active,
      role: parsed.data.role as Role | undefined,
    },
  });

  if (parsed.data.active === false) {
    await writeAudit({ actorId: actor.id, action: "ADMIN_DISABLED", entityType: "User", entityId: id });
  }
  if (parsed.data.role && parsed.data.role !== target.role) {
    await writeAudit({
      actorId: actor.id,
      action: "ROLE_CHANGED",
      entityType: "User",
      entityId: id,
      metadata: { from: target.role, to: parsed.data.role },
    });
  }
  return Response.json({ user: { id: updated.id, email: updated.email, role: updated.role, active: updated.active } });
}
