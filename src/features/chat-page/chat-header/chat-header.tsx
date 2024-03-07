import { FC } from "react";
import { ChatThread } from "@prisma/client";

interface Props {
  chatThread: ChatThread;
}

export const ChatHeader: FC<Props> = (props) => {
  return (
    <div className="bg-background border-b flex items-center py-2">
      <div className="container max-w-3xl flex justify-between items-center">
        <div className="flex flex-col">
          <span>{props.chatThread.title}</span>
        </div>
      </div>
    </div>
  );
};
