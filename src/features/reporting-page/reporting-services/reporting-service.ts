import { getCurrentUser } from "@/features/auth-page/helpers";
import {
  ChatMessageModel,
  ChatThreadModel,
} from "@/features/chat-page/chat-services/models";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { prisma } from "@/features/common/services/sql";

export const FindAllChatThreadsForAdmin = async (
  limit: number,
  offset: number
): Promise<ServerActionResponse<Array<ChatThreadModel>>> => {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    return {
      status: "ERROR",
      errors: [{ message: "You are not authorized to perform this action" }],
    };
  }

  try {
    const resources = await prisma.chatThread.findMany({
      where: { tenantId: user.tenantId },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });
    return {
      status: "OK",
      response: resources,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const FindAllChatMessagesForAdmin = async (
  chatThreadID: string
): Promise<ServerActionResponse<Array<ChatMessageModel>>> => {
  const user = await getCurrentUser();

  if (!user.isAdmin) {
    return {
      status: "ERROR",
      errors: [{ message: "You are not authorized to perform this action" }],
    };
  }

  try {
    const resources = await prisma.chatMessage.findMany({
      where: { threadId: chatThreadID },
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
