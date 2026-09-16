import { uploadProfileImageToS3 } from "@/lib/s3";
import { requireUser } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { jsonError } from "@/lib/utils";

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!(await rateLimit(`profile-photo:${ip}`, 20, 60_000))) return jsonError("Too many upload attempts.", 429);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return jsonError("Image file is required");

  try {
    const session = await requireUser();
    const uploaded = await uploadProfileImageToS3(file, session?.id ?? "staged");
    return Response.json({ url: uploaded.url, key: uploaded.key });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Image upload failed");
  }
}
