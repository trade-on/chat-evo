"use server";
import { createHash } from "crypto";

import { RedirectToPage } from "../common/navigation-helpers";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { redirect } from "next/navigation";
import { auth as firebaseClientAuth } from "./firebase/client";
import { auth as firebaseAdminAuth } from "./firebase/admin";
import { prisma } from "../common/services/sql";
import { auth } from "./auth-api";

// import { auth } from "./firebase/admin";

export const userSession = async (): Promise<Record<
  "user",
  UserModel
> | null> => {
  try {
    const session = await auth();
    console.log("--session--", session);
    if (session) {
      return {
        user: {
          ...session.user,
          id: session.customClaims.userId,
          displayName: session.customClaims.displayName,
          role: session.customClaims.role,
          tenantId: session.customClaims.tenantId,
        },
      };
    }
  } catch (error) {
    console.error("error", error);
  }

  return null;
};

export const getCurrentUser = async (): Promise<UserModel> => {
  const session = await userSession();
  console.log("getCurrentUser", session);
  if (session?.user) {
    return session.user;
  }
  throw new Error("User not found");
};

export const userHashedId = async (): Promise<string> => {
  const session = await userSession();
  if (session?.user) {
    return session.user.id;
  }
  throw new Error("User not found");
};

export const hashValue = (value: string): string => {
  const hash = createHash("sha256");
  hash.update(value);
  return hash.digest("hex");
};

export const redirectIfAuthenticated = async () => {
  const session = await userSession();
  if (session) {
    RedirectToPage("chat");
  }
};

export type UserModel = {
  id: string;
  email?: string | null;
  image?: string | null;
  displayName: string;
  role: string;
  tenantId: string;
};

// const signUp = async ({
//   email,
//   password,
// }: {
//   email: string;
//   password: string;
// }) => {
//   if (!email) return;
//   if (!password) return;
//   try {
//     const user = await auth.createUser({
//       email,
//       password,
//     });
//     if (!user.email) return;
//     const link = await auth.generateEmailVerificationLink(user.email);
//     return;
//     // 以降client側での処理
//     router.push("/signin");
//   } catch (e) {
//     console.error(e);
//   }
// };

export const signUpBillingUser = async (_: unknown, formData: FormData) => {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const tenantName = formData.get("tenant_name") as string;
  const displayName = formData.get("display_name") as string;

  if (!email) return;
  if (!password) return;
  try {
    const userCredential = await createUserWithEmailAndPassword(
      firebaseClientAuth,
      email,
      password
    );
    if (!userCredential.user.email) {
      throw new Error("User not found");
    }
    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
      },
    });
    const dbUser = await prisma.user.create({
      data: {
        email: userCredential.user.email,
        tenantId: tenant.id,
        name: displayName,
        role: "admin",
      },
    });
    await prisma.account.create({
      data: {
        id: userCredential.user.uid,
        provider: "password",
        userId: dbUser.id,
      },
    });
    await firebaseAdminAuth.setCustomUserClaims(userCredential.user.uid, {
      customClaims: {
        userId: dbUser.id,
        displayName,
        role: "admin",
        tenantId: tenant.id,
      },
    });
    await sendEmailVerification(userCredential.user);
  } catch (e) {
    console.error(e);
  }
  redirect("/auth/signin");
};

export const signUp = async (_: unknown, formData: FormData) => {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("display_name") as string;
  const tenantId = formData.get("tenant_id") as string;

  if (!email) return;
  if (!password) return;
  try {
    const userCredential = await createUserWithEmailAndPassword(
      firebaseClientAuth,
      email,
      password
    );
    if (!userCredential.user.email) {
      throw new Error("User not found");
    }
    const dbUser = await prisma.user.create({
      data: {
        email: userCredential.user.email,
        name: displayName,
        tenantId: tenantId,
      },
    });
    await prisma.account.create({
      data: {
        id: userCredential.user.uid,
        provider: "password",
        userId: dbUser.id,
      },
    });
    await firebaseAdminAuth.setCustomUserClaims(userCredential.user.uid, {
      customClaims: {
        userId: dbUser.id,
        displayName,
        role: dbUser.role,
        tenantId,
      },
    });
    await sendEmailVerification(userCredential.user);
  } catch (e) {
    console.error(e);
  }
  redirect("/auth/signin");
};
