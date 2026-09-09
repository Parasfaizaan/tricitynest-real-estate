import { prisma } from "@/lib/prisma";
import { requireStaff, unauthorized } from "@/lib/admin-guard";

export async function GET() {
  const user = await requireStaff();
  if (!user) return unauthorized();
  const [enquiries, contacts, sellLeads, newsletters] = await Promise.all([
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, include: { property: true } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.sellLead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.newsletter.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return Response.json({ enquiries, contacts, sellLeads, newsletters });
}
