import { requireStaff, unauthorized } from "@/lib/admin-guard";
import { jsonError } from "@/lib/utils";
import { uploadPropertyImageToS3 } from "@/lib/s3";

export async function POST(req: Request) {
  const user = await requireStaff();
  if (!user) return unauthorized();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("No file");
  try {
    const uploaded = await uploadPropertyImageToS3(file, "staged", 0, true);
    return Response.json({ url: uploaded.url, key: uploaded.key });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Image upload failed");
  }
}
