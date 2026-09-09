import { prisma } from "@/lib/prisma";
import { requireStaff, unauthorized } from "@/lib/admin-guard";

export async function GET() {
  const user = await requireStaff();
  if (!user) return unauthorized();
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      preference: true,
      matches: { include: { property: { select: { id: true, title: true, slug: true } } } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });
  return Response.json({ leads });
}
