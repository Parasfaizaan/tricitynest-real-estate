import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff, unauthorized } from "@/lib/admin-guard";
import { jsonError, slugify } from "@/lib/utils";
import { Category } from "@prisma/client";

export async function GET() {
  const user = await requireStaff();
  if (!user) return unauthorized();
  const [locations, propertyTypes, amenities, builders] = await Promise.all([
    prisma.location.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.propertyType.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.amenity.findMany({ orderBy: { name: "asc" } }),
    prisma.builder.findMany({ orderBy: { name: "asc" } }),
  ]);
  return Response.json({ locations, propertyTypes, amenities, builders });
}

const locSchema = z.object({
  kind: z.enum(["location", "type", "amenity"]),
  name: z.string().min(2),
  city: z.string().optional(),
  state: z.string().optional(),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL"]).optional(),
  imageUrl: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await requireStaff();
  if (!user) return unauthorized();
  const parsed = locSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Invalid taxonomy");
  const slug = slugify(parsed.data.name);

  if (parsed.data.kind === "location") {
    const row = await prisma.location.create({
      data: {
        name: parsed.data.name,
        slug,
        city: parsed.data.city || parsed.data.name,
        state: parsed.data.state || "Punjab",
        imageUrl: parsed.data.imageUrl,
      },
    });
    return Response.json({ location: row });
  }
  if (parsed.data.kind === "type") {
    const row = await prisma.propertyType.create({
      data: {
        name: parsed.data.name,
        slug,
        category: (parsed.data.category as Category) ?? Category.RESIDENTIAL,
      },
    });
    return Response.json({ propertyType: row });
  }
  const row = await prisma.amenity.create({ data: { name: parsed.data.name, slug } });
  return Response.json({ amenity: row });
}
