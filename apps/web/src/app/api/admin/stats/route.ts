import { prisma } from "@/lib/prisma";
import { requireStaff, unauthorized } from "@/lib/admin-guard";
import { DeletionRequestStatus, LeadStatus, PropertyStatus } from "@prisma/client";

export async function GET() {
  const user = await requireStaff();
  if (!user) return unauthorized();

  const [total, published, draft, archived, leads, newLeads, users, views, pendingDeletes, enquiries] =
    await Promise.all([
      prisma.property.count({ where: { deletedAt: null } }),
      prisma.property.count({ where: { status: PropertyStatus.PUBLISHED, deletedAt: null } }),
      prisma.property.count({ where: { status: PropertyStatus.DRAFT, deletedAt: null } }),
      prisma.property.count({ where: { status: PropertyStatus.ARCHIVED, deletedAt: null } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: LeadStatus.NEW } }),
      prisma.user.count(),
      prisma.property.aggregate({ _sum: { views: true } }),
      prisma.propertyDeletionRequest.count({ where: { status: DeletionRequestStatus.PENDING } }),
      prisma.enquiry.count(),
    ]);

  const recentLeads = await prisma.lead.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { preference: true },
  });

  return Response.json({
    total,
    published,
    draft,
    archived,
    leads,
    newLeads,
    users,
    views: views._sum.views ?? 0,
    pendingDeletes,
    enquiries,
    recentLeads,
  });
}
