import { prisma } from "./prisma";

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const since = new Date(Date.now() - windowMs);
  await prisma.rateLimitHit.deleteMany({ where: { createdAt: { lt: since } } });
  const count = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: since } },
  });
  if (count >= limit) return false;
  await prisma.rateLimitHit.create({ data: { key } });
  return true;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
