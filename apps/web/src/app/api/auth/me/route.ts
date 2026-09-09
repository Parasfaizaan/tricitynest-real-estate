import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  if (!user) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user });
}
