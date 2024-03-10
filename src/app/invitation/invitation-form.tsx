"use client";

import { ServerActionResponse } from "@/features/common/server-action-response";
import { useFormState } from "react-dom";
import { signUp } from "@/features/auth-page/helpers";

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
  console.log(tenantId, invitedEmail);
  return (
    <form action={formAction}>
      <input hidden name="tenant_id" defaultValue={tenantId} />
      <input name="display_name" placeholder="ユーザー名" />
      <input
        type="email"
        name="email"
        placeholder="メールアドレス"
        value={invitedEmail}
        readOnly
      />
      <input type="password" name="password" placeholder="パスワード" />
      <button>登録</button>
    </form>
  );
};
