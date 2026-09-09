import { prisma } from "@/lib/prisma";

export async function GET() {
  const locations = await prisma.location.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { properties: true } } },
  });
  return Response.json({ locations });
}
