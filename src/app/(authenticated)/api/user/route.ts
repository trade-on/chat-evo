import { prisma } from "@/features/common/services/sql";

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams
    .get("email")
    ?.replaceAll(" ", "+");

  if (!email) return new Response("No userId", { status: 400 });
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });

  return new Response(JSON.stringify({ user }), { status: 200 });
}
