"use client";

import { Button } from "@/features/ui/button";
import { LoadingIndicator } from "@/features/ui/loading";
import { Plus } from "lucide-react";
import { useFormStatus } from "react-dom";

export const NewChat = () => {
  const { pending } = useFormStatus();

  return (
    <Button
      aria-disabled={pending}
      size={"sm"}
      className="flex gap-2"
      variant={"default"}
    >
      {pending ? <LoadingIndicator isLoading={pending} /> : <Plus size={18} />}
      新しいチャットを開始
    </Button>
  );
};
