"use server";
import "server-only";

import {
  getCurrentUser,
  userHashedId,
  userSession,
} from "@/features/auth-page/helpers";
import { RedirectToChatThread } from "@/features/common/navigation-helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { NEW_CHAT_NAME } from "@/features/theme/theme-config";
import { HistoryContainer } from "../../common/services/cosmos";
import { prisma } from "@/features/common/services/sql";
import { ChatThread } from "@prisma/client";

export const FindAllChatThreadForCurrentUser = async (): Promise<
  ServerActionResponse<Array<ChatThread>>
> => {
  try {
    const resources = await prisma.chatThread.findMany({
      where: {
        userId: await userHashedId(),
        isDeleted: false,
      },
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

export const FindChatThreadForCurrentUser = async (
  id: string
): Promise<ServerActionResponse<ChatThread>> => {
  try {
    const resources = await prisma.chatThread.findUniqueOrThrow({
      where: {
        id,
        userId: await userHashedId(),
        isDeleted: false,
      },
    });

    if (!resources) {
      return {
        status: "NOT_FOUND",
        errors: [{ message: `Chat thread not found` }],
      };
    }

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

export const SoftDeleteChatThreadForCurrentUser = async (
  chatThreadID: string
): Promise<ServerActionResponse<ChatThread>> => {
  try {
    const chatThreadResponse = await FindChatThreadForCurrentUser(chatThreadID);

    if (chatThreadResponse.status !== "OK") {
      throw new Error("Chat thread not found");
    }
    await prisma.chatMessage.updateMany({
      where: {
        threadId: chatThreadID,
      },
      data: {
        isDeleted: true,
      },
    });

    const resource = await prisma.chatThread.update({
      where: {
        id: chatThreadID,
      },
      data: {
        isDeleted: true,
      },
    });
    if (!resource) {
      throw new Error("Updating Chat thread Failed");
    }
    return {
      status: "OK",
      response: resource,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const EnsureChatThreadOperation = async (
  chatThreadID: string
): Promise<ServerActionResponse<ChatThread>> => {
  const response = await FindChatThreadForCurrentUser(chatThreadID);
  const currentUser = await getCurrentUser();
  const hashedId = await userHashedId();

  if (response.status !== "OK") throw new Error("Chat thread not found");
  if (currentUser.isAdmin || response.response.userId === hashedId) {
    throw new Error("Unauthorized to perform this operation");
  }

  return response;
};

export const UpsertChatThread = async (
  chatThread: ChatThread
): Promise<ServerActionResponse<ChatThread>> => {
  try {
    if (chatThread.id) {
      const response = await EnsureChatThreadOperation(chatThread.id);
      if (response.status !== "OK") {
        return response;
      }
    }

    chatThread.lastMessageAt = new Date();
    const { resource } = await HistoryContainer().items.upsert<ChatThread>(
      chatThread
    );

    if (resource) {
      return {
        status: "OK",
        response: resource,
      };
    }

    return {
      status: "ERROR",
      errors: [{ message: `Chat thread not found` }],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const CreateChatThread = async (): Promise<
  ServerActionResponse<ChatThread>
> => {
  try {
    const user = await userSession();
    if (!user?.id || !user?.name || !user?.tenantId) {
      throw new Error("User or Tenant not found");
    }
    const modelToSave: Omit<ChatThread, "id" | "createdAt" | "updatedAt"> = {
      title: NEW_CHAT_NAME,
      userName: user.name,
      userId: user.id,
      lastMessageAt: new Date(),
      isDeleted: false,
      tenantId: user.tenantId,
    };

    const resource = await prisma.chatThread.create({ data: modelToSave });
    if (resource) {
      return {
        status: "OK",
        response: resource,
      };
    }

    return {
      status: "ERROR",
      errors: [{ message: `Chat thread not found` }],
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const UpdateChatTitle = async (
  chatThreadId: string,
  title: string
): Promise<ServerActionResponse<ChatThread>> => {
  try {
    const response = await FindChatThreadForCurrentUser(chatThreadId);
    if (response.status === "OK") {
      const chatThread = response.response;
      // take the first 30 characters
      chatThread.title = title.substring(0, 30);
      return await UpsertChatThread(chatThread);
    }
    return response;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [{ message: `${error}` }],
    };
  }
};

export const CreateChatAndRedirect = async () => {
  const response = await CreateChatThread();
  if (response.status === "OK") {
    RedirectToChatThread(response.response.id);
  }
};
