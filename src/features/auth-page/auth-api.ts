import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "password",
      credentials: {},
      authorize: async ({ idToken, ...rest }: any, _req) => {
        console.log("in authorize", { idToken, rest });
        if (idToken) {
          try {
            const res = await fetch(
              new URL(
                `/auth/api/firebase?idToken=${idToken}`,
                process.env.NEXT_PUBLIC_ORIGIN
              ).toString()
            );
            const { token, ...rest } = await res.json();
            return token;
          } catch (err) {
            console.error(err);
          }
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, ...rest }) => {
      console.log("in jwt", { token, rest });
      return { ...token };
    },
    // sessionにJWTトークンからのユーザ情報を格納
    session: async ({ token, session, ...rest }) => {
      console.log("in session", { token, session, rest });
      return { ...token, ...session };
    },
    signIn: async ({ user, ...rest }) => {
      console.log("in signin", { user, rest });
      // メールアドレスが認証済みかでなかったらログイン不可
      return !!user?.email_verified;
    },
    authorized: async (x) => {
      console.log("in authorized", { x });
      // return !!user?.email_verified;
      return true;
    },
  },
  pages: {
    signIn: "/",
  },
});

// {
//   user: {
//     token: {
//       token: [Object],
//       iat: 1709664856,
//       exp: 1712256856,
//       jti: '14ac3a39-1cd2-45b2-a5a1-e7d9cb83166e'
//     },
//     iat: 1709664856,
//     exp: 1712256856,
//     jti: '14ac3a39-1cd2-45b2-a5a1-e7d9cb83166e'
//   },
//   session: { user: {}, expires: '2024-04-04T18:54:32.320Z' },
//   token: {
//     token: {
//       token: [Object],
//       iat: 1709664856,
//       exp: 1712256856,
//       jti: '14ac3a39-1cd2-45b2-a5a1-e7d9cb83166e'
//     },
//     iat: 1709664856,
//     exp: 1712256856,
//     jti: '14ac3a39-1cd2-45b2-a5a1-e7d9cb83166e'
//   }
// }
