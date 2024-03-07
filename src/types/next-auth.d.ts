import { $Enums } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

// https://next-auth.js.org/getting-started/typescript#module-augmentation

declare module "next-auth" {
  interface Session {
    customClaims: {
      userId: string;
      displayName: string;
      role: string;
      tenantId: string;
    };
    user_id: string;
    email_verified: boolean;
  }

  interface Token {
    role: $Enums.UserRole;
  }

  interface User {
    role: $Enums.UserRole;
    email_verified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    customClaims: {
      userId: string;
      displayName: string;
      role: string;
      tenantId: string;
    };
    user_id: string;
    email_verified: boolean;
  }
}
