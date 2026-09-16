import { z } from "zod";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { jsonError } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const phoneRegex = /^(?:\+91[\s-]?|91[\s-]?|0)?[6-9]\d{9}$/;

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  profilePhotoUrl: z.string().url().optional().or(z.literal("")),
  socialLinks: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!(await rateLimit(`signup:${ip}`, 8, 60_000))) return jsonError("Too many signup attempts.", 429);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid signup details");

  const email = parsed.data.email.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return jsonError("Email already in use");

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      phone: parsed.data.phone.replace(/[\s-]/g, ""),
      passwordHash: bcrypt.hashSync(parsed.data.password, 10),
      profilePhotoUrl: parsed.data.profilePhotoUrl || null,
      socialLinks: parsed.data.socialLinks?.trim() || null,
      role: Role.USER,
    },
  });

  const token = await createSessionToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(token);
  await writeAudit({
    actorId: user.id,
    action: "USER_SIGNED_UP",
    entityType: "User",
    entityId: user.id,
    metadata: { email: user.email },
    ip,
  });

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      profilePhotoUrl: user.profilePhotoUrl,
      socialLinks: user.socialLinks,
    },
  });
}
