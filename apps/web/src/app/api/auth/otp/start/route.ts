import { z } from "zod";
import { jsonError } from "@/lib/utils";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { normalizeIndianPhone } from "@/lib/phone";
import { sendPhoneOtp } from "@/lib/twilio-verify";

const schema = z.object({
  phone: z.string().trim().min(8),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!(await rateLimit(`otp-start:${ip}`, 8, 60_000))) {
    return jsonError("Too many OTP requests. Please wait a moment.", 429);
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Enter a valid Indian mobile number.");

  const phone = normalizeIndianPhone(parsed.data.phone);
  if (!phone) return jsonError("Enter a valid Indian mobile number.");

  const result = await sendPhoneOtp(phone);

  return Response.json({
    ok: true,
    phone,
    staticOtp: result.staticOtp,
  });
}
