import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { jsonError } from "@/lib/utils";

const phoneRegex = /^(?:\+91[\s-]?|91[\s-]?|0)?[6-9]\d{9}$/;

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Valid email is required").optional().or(z.literal("")),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid Indian mobile number"),
  profilePhotoUrl: z.string().url().optional().or(z.literal("")),
  socialLinks: z.string().max(1000).optional(),
});

export async function GET() {
  const session = await requireUser();
  if (!session) return jsonError("Unauthorized", 401);
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      profilePhotoUrl: true,
      socialLinks: true,
      createdAt: true,
    },
  });
  return Response.json({ user });
}

export async function PATCH(req: Request) {
  const session = await requireUser();
  if (!session) return jsonError("Unauthorized", 401);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid profile details");

  const current = await prisma.user.findUnique({ where: { id: session.id }, select: { email: true } });
  const email = parsed.data.email?.trim().toLowerCase();
  if (email && email !== current?.email) {
    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists && exists.id !== session.id) return jsonError("Email already in use");
  }

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: {
      name: parsed.data.name,
      ...(email ? { email } : {}),
      phone: parsed.data.phone.replace(/[\s-]/g, ""),
      profilePhotoUrl: parsed.data.profilePhotoUrl || null,
      socialLinks: parsed.data.socialLinks?.trim() || null,
    },
  });
  await writeAudit({
    actorId: updated.id,
    action: "USER_PROFILE_UPDATED",
    entityType: "User",
    entityId: updated.id,
    metadata: { changedFields: ["name", "email", "phone", "profilePhotoUrl", "socialLinks"] },
  });
  return Response.json({
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      role: updated.role,
      profilePhotoUrl: updated.profilePhotoUrl,
      socialLinks: updated.socialLinks,
    },
  });
}
