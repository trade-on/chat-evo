"use server";
import "server-only";

import { userHashedId } from "@/features/auth-page/helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { ChatRole } from "./models";
import { prisma } from "@/features/common/services/sql";
import { ChatMessage } from "@prisma/client";

export const FindTopChatMessagesForCurrentUser = async (
  chatThreadID: string,
  top: number = 30
): Promise<ServerActionResponse<Array<ChatMessage>>> => {
  try {
    const resources = await prisma.chatMessage.findMany({
      where: {
        threadId: chatThreadID,
        userId: await userHashedId(),
        isDeleted: false,
      },
      take: top,
      orderBy: { createdAt: "desc" },
    });

    return {
      status: "OK",
      response: resources,
    };
  } catch (e) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};

export const FindAllChatMessagesForCurrentUser = async (
  chatThreadID: string
): Promise<ServerActionResponse<Array<ChatMessage>>> => {
  try {
    const resources = await prisma.chatMessage.findMany({
      where: {
        threadId: chatThreadID,
        userId: await userHashedId(),
        isDeleted: false,
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      status: "OK",
      response: resources,
    };
  } catch (e) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};

export const CreateChatMessage = async ({
  name,
  content,
  role,
  chatThreadId,
  multiModalImage,
}: {
  name: string;
  role: ChatRole;
  content: string;
  chatThreadId: string;
  multiModalImage?: string | null;
}): Promise<ServerActionResponse<ChatMessage>> => {
  const userId = await userHashedId();
  const modelToSave: Omit<ChatMessage, "id" | "createdAt" | "updatedAt"> = {
    content,
    name,
    role,
    userId: userId,
    threadId: chatThreadId,
    isDeleted: false,
    multiModalImage: multiModalImage ?? null,
  };
  return await UpsertChatMessage(modelToSave);
};

export const UpsertChatMessage = async (
  chatModel: Omit<ChatMessage, "id" | "createdAt" | "updatedAt">
): Promise<ServerActionResponse<ChatMessage>> => {
  try {
    const resource = await prisma.chatMessage.create({ data: chatModel });

    if (resource) {
      return {
        status: "OK",
        response: resource,
      };
    }

    return {
      status: "ERROR",
      errors: [
        {
          message: `Chat message not found`,
        },
      ],
    };
  } catch (e) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `${e}`,
        },
      ],
    };
  }
};
