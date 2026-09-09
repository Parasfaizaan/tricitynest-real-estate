import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuper, unauthorized } from "@/lib/admin-guard";
import { jsonError } from "@/lib/utils";
import { writeAudit } from "@/lib/audit";
import { Role } from "@prisma/client";

export async function GET() {
  const user = await requireSuper();
  if (!user) return unauthorized();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return Response.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      active: u.active,
      createdAt: u.createdAt,
    })),
  });
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "USER"]).default("ADMIN"),
});

export async function POST(req: Request) {
  const actor = await requireSuper();
  if (!actor) return unauthorized();
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid user");
  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (exists) return jsonError("Email already in use");
  const created = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash: bcrypt.hashSync(parsed.data.password, 10),
      role: parsed.data.role as Role,
    },
  });
  await writeAudit({
    actorId: actor.id,
    action: "ADMIN_CREATED",
    entityType: "User",
    entityId: created.id,
    metadata: { email: created.email, role: created.role },
  });
  return Response.json({ user: { id: created.id, email: created.email, name: created.name, role: created.role } });
}
