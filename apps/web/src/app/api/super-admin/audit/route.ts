import { prisma } from "@/lib/prisma";
import { requireSuper, unauthorized } from "@/lib/admin-guard";

export async function GET() {
  const user = await requireSuper();
  if (!user) return unauthorized();
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { actor: { select: { name: true, email: true } } },
  });
  return Response.json({ logs });
}
