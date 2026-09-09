import { requireStaff, unauthorized } from "@/lib/admin-guard";
import { jsonError } from "@/lib/utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const user = await requireStaff();
  if (!user) return unauthorized();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("No file");
  if (file.size > 5_000_000) return jsonError("File too large");
  if (!file.type.startsWith("image/")) return jsonError("Images only");
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return Response.json({ url: `/uploads/${name}` });
}
