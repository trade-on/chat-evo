"use client";
import { auth as firebaseClientAuth } from "@/features/auth-page/firebase/client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { signIn as signInByNextAuth } from "next-auth/react";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = async () => {
    if (!email || !password) return;
    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseClientAuth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      // ここより上の処理はserver actionでやりつつprismaからtenant_idを取得、返り値をsignInByNextAuthに渡すとか？
      await signInByNextAuth("credentials", {
        callbackUrl: "/chat",
        idToken,
      });
    } catch (error) {
      console.error("Error signing in", error);
    }
  };
  return (
    <div>
      <input
        type="email"
        name="email"
        placeholder="メールアドレス"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        name="password"
        placeholder="パスワード"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="button" onClick={signIn}>
        ログイン
      </button>
    </div>
  );
};

export default SignIn;
