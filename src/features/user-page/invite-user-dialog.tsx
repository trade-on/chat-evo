"use client";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { PlusCircleIcon, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { inviteUsers } from "./user-services";

type InviteFormType = {
  users: { email: string; role: "admin" | "member" }[];
};

export const InviteUserDialog = () => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, control } = useForm<InviteFormType>({
    defaultValues: { users: [{ role: "member" }] },
  });
  const { fields, append, remove } = useFieldArray({ name: "users", control });
  const session = useSession();
  const onSubmit = handleSubmit(async (data) => {
    const userId = session.data?.customClaims.userId;
    if (!userId) return;
    await inviteUsers(data.users, userId);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button size="default" type="button" variant={"default"}>
          ユーザーを招待
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[300px] md:h-[800px] md:min-w-[800px] lg:h-[800px] lg:min-w-[800px] ">
        <DialogHeader>
          <DialogTitle>
            <h1 className="text-2xl font-bold mb-4">ユーザーを招待</h1>
          </DialogTitle>
          <form onSubmit={onSubmit}>
            {fields.map((field, index) => (
              <div key={field.id}>
                <div>
                  <label>
                    メールアドレス
                    <input
                      type="email"
                      {...register(`users.${index}.email`, {
                        required: "メールアドレスは必須です",
                      })}
                    />
                  </label>
                  <label>
                    権限
                    <select {...register(`users.${index}.role`)}>
                      <option value={"member"}>メンバー</option>
                      <option value={"admin"}>管理者</option>
                    </select>
                  </label>
                  {fields.length > 1 && (
                    <Button
                      size={"icon"}
                      variant={"outline"}
                      onClick={() => remove(index)}
                    >
                      <X size={20} />
                    </Button>
                  )}
                </div>
                {!!(index + 1 >= fields.length) && (
                  <Button
                    variant={"ghost"}
                    size={"sm"}
                    onClick={() => append({ email: "", role: "member" })}
                  >
                    <PlusCircleIcon size={20} /> 招待するユーザーを追加
                  </Button>
                )}
              </div>
            ))}
            <Button size="default" variant={"secondary"}>
              招待を送信
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
