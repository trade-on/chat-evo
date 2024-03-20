"use client";

import { ServerActionResponse } from "@/features/common/server-action-response";
import { useFormState } from "react-dom";
import { signUp } from "@/features/auth-page/helpers";
import { Label } from "@/features/ui/label";
import { Input } from "@/features/ui/input";
import { Button } from "@/features/ui/button";

type InvitationFormProps = {
  tenantId: string;
  invitedEmail: string;
};

export const InvitationForm = ({
  tenantId,
  invitedEmail,
}: InvitationFormProps) => {
  const initialState: ServerActionResponse | undefined = undefined;
  const [, formAction] = useFormState(signUp, initialState);
  return (
    <form action={formAction} className="flex flex-col gap-8 rounded-md">
      <input hidden name="tenant_id" defaultValue={tenantId} />
      <Label>
        ユーザー名
        <Input name="display_name" placeholder="田中太郎" className="mt-2" />
      </Label>
      <Label>
        メールアドレス
        <Input
          type="email"
          name="email"
          placeholder="example@example.com"
          readOnly
          className="mt-2"
        />
      </Label>
      <Label>
        パスワード
        <Input type="password" name="password" className="mt-2" />
      </Label>
      <Button size={"lg"}>登録</Button>
    </form>
  );
};
