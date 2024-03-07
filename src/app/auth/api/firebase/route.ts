import { auth } from "@/features/auth-page/firebase/admin";

export async function GET(req: Request) {
  const idToken = new URL(req.url).searchParams.get("idToken");
  if (!idToken) return new Response("No idToken", { status: 400 });
  const token = await auth.verifyIdToken(idToken);

  return new Response(JSON.stringify({ token }), { status: 200 });
}
