import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Provider } from "next-auth/providers/index";
import { hashValue } from "./helpers";
import AzureADB2CProvider from "next-auth/providers/azure-ad-b2c";

const configureIdentityProvider = () => {
  const providers: Array<Provider> = [];

  const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map((email) =>
    email.toLowerCase().trim()
  );

  if (
    process.env.AZURE_AD_B2C_TENANT_NAME &&
    process.env.AZURE_AD_B2C_CLIENT_ID &&
    process.env.AZURE_AD_B2C_CLIENT_SECRET &&
    process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW
  ) {
    providers.push(
      AzureADB2CProvider({
        tenantId: process.env.AZURE_AD_B2C_TENANT_NAME,
        clientId: process.env.AZURE_AD_B2C_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET,
        primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW,
        authorization: {
          params: {
            scope: `https://${process.env.AZURE_AD_B2C_TENANT_NAME}.onmicrosoft.com/api/all.crud offline_access openid`,
          },
        },
        async profile(profile) {
          const newProfile = {
            ...profile,
            // throws error without this - unsure of the root cause (https://stackoverflow.com/questions/76244244/profile-id-is-missing-in-google-oauth-profile-response-nextauth)
            id: profile.sub,
            isAdmin:
              adminEmails?.includes(profile.email.toLowerCase()) ||
              adminEmails?.includes(profile.preferred_username.toLowerCase()),
          };
          return newProfile;
        },
      })
    );
  }

  // If we're in local dev, add a basic credential provider option as well
  // (Useful when a dev doesn't have access to create app registration in their tenant)
  // This currently takes any username and makes a user with it, ignores password
  // Refer to: https://next-auth.js.org/configuration/providers/credentials
  if (process.env.NODE_ENV === "development") {
    providers.push(
      CredentialsProvider({
        name: "localdev",
        credentials: {
          username: { label: "Username", type: "text", placeholder: "dev" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials, req): Promise<any> {
          // You can put logic here to validate the credentials and return a user.
          // We're going to take any username and make a new user with it
          // Create the id as the hash of the email as per userHashedId (helpers.ts)
          const username = credentials?.username || "dev";
          const email = username + "@localhost";
          const user = {
            id: hashValue(email),
            name: username,
            email: email,
            isAdmin: false,
            image: "",
          };
          console.log(
            "=== DEV USER LOGGED IN:\n",
            JSON.stringify(user, null, 2)
          );
          return user;
        },
      })
    );
  }

  return providers;
};

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.isAdmin) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user.isAdmin = token.isAdmin as boolean;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};

export const handlers = NextAuth(options);
