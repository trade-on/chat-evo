"use client";

import { ServerActionResponse } from "@/features/common/server-action-response";
import { useFormState } from "react-dom";
import { signUp } from "@/features/auth-page/helpers";

type InvitationFormProps = {
  tenantId: string;
};

export const InvitationForm = ({ tenantId }: InvitationFormProps) => {
  const initialState: ServerActionResponse | undefined = undefined;
  const [, formAction] = useFormState(signUp, initialState);

  return (
    <form action={formAction}>
      <input hidden name="tenant_id" value={tenantId} />
      <input name="display_name" placeholder="ユーザー名" />
      <input type="email" name="email" placeholder="メールアドレス" />
      <input type="password" name="password" placeholder="パスワード" />
      <button>登録</button>
    </form>
  );
};
