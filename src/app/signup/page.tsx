"use client";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { useFormState } from "react-dom";
import { signUpBillingUser } from "@/features/auth-page/helpers";
import { Input } from "@/features/ui/input";
import { Button } from "@/features/ui/button";
import { Label } from "@/features/ui/label";

const SingUp = () => {
  const initialState: ServerActionResponse | undefined = undefined;

  const [formState, formAction] = useFormState(signUpBillingUser, initialState);
  return (
    <main className="bg-secondary w-[100%]">
      <section className="max-w-3xl mx-auto mt-64 px-20 py-28 bg-white">
        <h1 className="font-bold font-xl mb-8">アカウント作成</h1>
        <form action={formAction} className="flex flex-col gap-8 rounded-md">
          <Label>
            組織名
            <Input
              name="tenant_name"
              placeholder="株式会社◯◯"
              className="mt-2"
            />
          </Label>
          <Label>
            ユーザー名
            <Input
              name="display_name"
              placeholder="田中太郎"
              className="mt-2"
            />
          </Label>
          <Label>
            メールアドレス
            <Input
              type="email"
              name="email"
              placeholder="example@example.com"
              className="mt-2"
            />
          </Label>
          <Label>
            パスワード
            <Input type="password" name="password" className="mt-2" />
          </Label>
          <Button size={"lg"}>登録</Button>
        </form>
      </section>
    </main>
  );
};

export default SingUp;
