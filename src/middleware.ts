import { getToken } from "next-auth/jwt";
import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { auth } from "./features/auth-page/auth-api";

const requireAuth: string[] = [
  "/chat",
  "/api",
  "/reporting",
  "/unauthorized",
  "/persona",
  "/prompt",
];
const requireAdmin: string[] = ["/reporting"];

export const middleware = auth((request) => {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  if (requireAuth.some((path) => pathname.startsWith(path))) {
    const user = request.auth?.user;
    //check not logged in
    if (!user) {
      const url = new URL(`/`, request.nextUrl.origin);
      return NextResponse.redirect(url);
    }

    if (requireAdmin.some((path) => pathname.startsWith(path))) {
      //check if not authorized
      if (request.auth?.customClaims.role !== "admin") {
        const url = new URL(`/unauthorized`, request.nextUrl.origin);
        return NextResponse.rewrite(url);
      }
    }
  }
}) as NextMiddleware;

// export async function middleware(request: NextRequest) {
//   const res = NextResponse.next();
//   const pathname = request.nextUrl.pathname;

//   if (requireAuth.some((path) => pathname.startsWith(path))) {
//     const token = await getToken({
//       req: request,
//     });

//     //check not logged in
//     if (!token) {
//       const url = new URL(`/`, request.url);
//       return NextResponse.redirect(url);
//     }

//     if (requireAdmin.some((path) => pathname.startsWith(path))) {
//       //check if not authorized
//       if (!token.isAdmin) {
//         const url = new URL(`/unauthorized`, request.url);
//         return NextResponse.rewrite(url);
//       }
//     }
//   }

//   return res;
// }

// note that middleware is not applied to api/auth as this is required to logon (i.e. requires anon access)
export const config = {
  matcher: [
    "/unauthorized/:path*",
    "/reporting/:path*",
    "/api/chat:path*",
    "/api/images:path*",
    "/chat/:path*",
  ],
};
