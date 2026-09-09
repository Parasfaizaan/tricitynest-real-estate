import { prisma } from "@/lib/prisma";
import { requireSuper, unauthorized } from "@/lib/admin-guard";

export async function GET() {
  const user = await requireSuper();
  if (!user) return unauthorized();
  const requests = await prisma.propertyDeletionRequest.findMany({
    orderBy: { requestedAt: "desc" },
    include: {
      property: { include: { images: true, location: true } },
      requestedBy: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true, email: true } },
    },
  });
  return Response.json({ requests });
}
