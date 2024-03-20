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
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
          <form onSubmit={onSubmit} className="w-[65%] mx-auto">
            {fields.map((field, index) => (
              <div key={field.id} className="mb-4">
                <div className="flex items-end gap-4">
                  <Label className="flex flex-col gap-2 flex-1">
                    メールアドレス
                    <Input
                      type="email"
                      {...register(`users.${index}.email`, {
                        required: "メールアドレスは必須です",
                      })}
                    />
                  </Label>
                  <Label className="flex flex-col gap-2">
                    権限
                    <Select {...register(`users.${index}.role`)}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">メンバー</SelectItem>
                        <SelectItem value="admin">管理者</SelectItem>
                      </SelectContent>
                    </Select>
                  </Label>
                  {fields.length > 1 && (
                    <Button
                      size={"icon"}
                      variant={"ghost"}
                      onClick={() => remove(index)}
                    >
                      <X size={20} />
                    </Button>
                  )}
                </div>
                {!!(index + 1 >= fields.length) && (
                  <Button
                    variant={"outline"}
                    size={"sm"}
                    onClick={() => append({ email: "", role: "member" })}
                    className="mt-4"
                  >
                    <PlusCircleIcon size={20} /> 招待するユーザーを追加
                  </Button>
                )}
              </div>
            ))}
            <Button size="default" variant={"default"} className="mt-6">
              招待を送信
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
