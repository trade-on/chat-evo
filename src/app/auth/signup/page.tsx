"use client";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/features/auth-page/firebase/client";
import { useRouter } from "next/navigation";
import { signIn as signInByNextAuth } from "next-auth/react";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { useFormState } from "react-dom";
import { signUpBillingUser } from "@/features/auth-page/helpers";

const SingUp = () => {
  const initialState: ServerActionResponse | undefined = undefined;

  const [, formAction] = useFormState(signUpBillingUser, initialState);

  return (
    <form action={formAction}>
      <input name="tenant_name" placeholder="組織名" />
      <input name="display_name" placeholder="ユーザー名" />
      <input type="email" name="email" placeholder="メールアドレス" />
      <input type="password" name="password" placeholder="パスワード" />
      <button>登録</button>
    </form>
  );
};

export default SingUp;
