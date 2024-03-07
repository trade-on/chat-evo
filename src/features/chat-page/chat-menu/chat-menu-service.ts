"use server";

import {
  RedirectToPage,
  RevalidateCache,
} from "@/features/common/navigation-helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import {
  FindAllChatThreadForCurrentUser,
  SoftDeleteChatThreadForCurrentUser,
  UpsertChatThread,
} from "../chat-services/chat-thread-service";

import { ChatThread } from "@prisma/client";

export const DeleteChatThreadByID = async (chatThreadID: string) => {
  await SoftDeleteChatThreadForCurrentUser(chatThreadID);
  RedirectToPage("chat");
};

export const DeleteAllChatThreads = async (): Promise<
  ServerActionResponse<boolean>
> => {
  const chatThreadResponse = await FindAllChatThreadForCurrentUser();

  if (chatThreadResponse.status === "OK") {
    const chatThreads = chatThreadResponse.response;
    const promise = chatThreads.map(async (chatThread) => {
      return SoftDeleteChatThreadForCurrentUser(chatThread.id);
    });

    await Promise.all(promise);
    RevalidateCache({
      page: "chat",
      type: "layout",
    });
    return {
      status: "OK",
      response: true,
    };
  }

  return chatThreadResponse;
};

export const UpdateChatThreadTitle = async (props: {
  chatThread: ChatThread;
  title: string;
}) => {
  await UpsertChatThread({
    ...props.chatThread,
    title: props.title,
  });

  RevalidateCache({
    page: "chat",
    type: "layout",
  });
};

export const BookmarkChatThread = async (props: { chatThread: ChatThread }) => {
  await UpsertChatThread({
    ...props.chatThread,
    bookmarked: !props.chatThread.bookmarked,
  });

  RevalidateCache({
    page: "chat",
    type: "layout",
  });
};
