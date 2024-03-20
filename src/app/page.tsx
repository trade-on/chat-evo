"use client";
import { auth as firebaseClientAuth } from "@/features/auth-page/firebase/client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { signIn as signInByNextAuth } from "next-auth/react";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";
import { Input } from "@/features/ui/input";

const Home = () => {
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
    <div className="flex gap-6 flex-col m-auto w-80">
      <Label>
        メールアドレス
        <Input
          type="email"
          name="email"
          placeholder="example@example.com"
          className="mt-2"
          onChange={(e) => setEmail(e.target.value)}
        />
      </Label>
      <Label>
        パスワード
        <Input
          type="password"
          name="password"
          className="mt-2"
          onChange={(e) => setPassword(e.target.value)}
        />
      </Label>
      <Button size={"lg"} type="button" onClick={signIn}>
        ログイン
      </Button>
    </div>
  );
};

export default Home;
