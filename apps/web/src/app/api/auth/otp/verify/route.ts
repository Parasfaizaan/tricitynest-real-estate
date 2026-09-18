import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { grantPriceAccess } from "@/lib/price-access";
import { jsonError } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { normalizeIndianPhone, phoneOnlyEmail } from "@/lib/phone";
import { verifyPhoneOtp } from "@/lib/twilio-verify";
import { writeAudit } from "@/lib/audit";

const schema = z.object({
  phone: z.string().trim().min(8),
  code: z.string().trim().min(4).max(10),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!(await rateLimit(`otp-verify:${ip}`, 12, 60_000))) {
    return jsonError("Too many OTP attempts. Please wait a moment.", 429);
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Enter the OTP sent to your phone.");

  const phone = normalizeIndianPhone(parsed.data.phone);
  if (!phone) return jsonError("Enter a valid Indian mobile number.");

  const verified = await verifyPhoneOtp(phone, parsed.data.code);
  if (!verified) return jsonError("Invalid OTP. Please try again.", 401);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ phone }, { email: phoneOnlyEmail(phone) }] },
    orderBy: { createdAt: "asc" },
  });
  if (existing && existing.role !== Role.USER) return jsonError("Please use staff login for this account.", 403);
  if (existing && !existing.active) return jsonError("Your account is suspended. Please contact admin.", 403);

  const user =
    existing ??
    (await prisma.user.create({
      data: {
        email: phoneOnlyEmail(phone),
        name: "Tricity User",
        phone,
        passwordHash: bcrypt.hashSync(`otp:${phone}:${randomUUID()}`, 10),
        role: Role.USER,
      },
    }));

  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
  });
  await setSessionCookie(token);
  await grantPriceAccess();
  await writeAudit({
    actorId: user.id,
    action: existing ? "OTP_LOGIN" : "OTP_USER_CREATED",
    entityType: "User",
    entityId: user.id,
    metadata: { phone },
    ip,
  });

  const needsProfile = user.name === "" || user.email === phoneOnlyEmail(phone);
  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      needsProfile,
    },
  });
}
