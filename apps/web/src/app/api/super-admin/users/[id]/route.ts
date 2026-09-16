import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireStaff, unauthorized } from "@/lib/admin-guard";
import { jsonError } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";
import { Role } from "@prisma/client";

const schema = z.object({
  active: z.boolean().optional(),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireStaff();
  if (!actor) return unauthorized();
  const { id } = await ctx.params;
  if (id === actor.id) return jsonError("You cannot change your own account here.");
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid payload");
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return jsonError("Not found", 404);
  if (target.role === Role.SUPER_ADMIN) return jsonError("Super admin accounts cannot be changed here.", 403);
  if (actor.role !== Role.SUPER_ADMIN && target.role !== Role.USER) return jsonError("Only super admins can change staff accounts.", 403);
  if (actor.role !== Role.SUPER_ADMIN && parsed.data.role) return jsonError("Only super admins can change roles.", 403);

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

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireStaff();
  if (!actor) return unauthorized();
  const { id } = await ctx.params;
  if (id === actor.id) return jsonError("You cannot delete your own account here.");

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return jsonError("Not found", 404);
  if (target.role === Role.SUPER_ADMIN) return jsonError("Super admin accounts cannot be deleted here.", 403);
  if (actor.role !== Role.SUPER_ADMIN && target.role !== Role.USER) return jsonError("Only super admins can delete staff accounts.", 403);

  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    await prisma.user.update({
      where: { id },
      data: {
        email: `deleted-${id}-${Date.now()}@deleted.local`,
        passwordHash: bcrypt.hashSync(`deleted:${id}:${Date.now()}`, 10),
        name: "Deleted user",
        phone: null,
        profilePhotoUrl: null,
        socialLinks: null,
        active: false,
      },
    });
  }

  await writeAudit({ actorId: actor.id, action: "USER_DELETED", entityType: "User", entityId: id });
  return Response.json({ ok: true });
}
