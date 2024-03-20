"use server";
import "server-only";

import { getCurrentUser, userHashedId } from "@/features/auth-page/helpers";
import { ServerActionResponse } from "@/features/common/server-action-response";
import { ChatRole } from "./models";
import { prisma } from "@/features/common/services/sql";
import { ChatMessage } from "@prisma/client";
import { create } from "domain";

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
    const user = await getCurrentUser();

    const resources = await prisma.chatMessage.findMany({
      where: {
        threadId: chatThreadID,
        // userId: user.id,
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

export const CreateChatMessage = async (
  model: Omit<ChatMessage, "id" | "createdAt" | "updatedAt" | "tokenId">
): Promise<ServerActionResponse<ChatMessage>> => {
  return await UpsertChatMessage(model);
};

export const UpsertChatMessage = async (
  chatModel: Omit<ChatMessage, "id" | "createdAt" | "updatedAt" | "tokenId">
): Promise<ServerActionResponse<ChatMessage>> => {
  try {
    const user = await getCurrentUser();
    console.log("🟢🟢UpsertChatMessage 1🟢🟢");

    const token = await prisma.token.create({
      data: {
        ioType: chatModel.ioType,
        model: chatModel.model,
        count: chatModel.content.length,
        tenantId: chatModel.tenantId,
        userId: user.id,
        threadId: chatModel.threadId,
        chatMessageId: "",
      },
    });
    console.log("🟢🟢UpsertChatMessage 2🟢🟢", { token });

    const resource = await prisma.chatMessage.create({
      data: { ...chatModel, tokenId: token.id },
    });
    console.log("🟢🟢UpsertChatMessage 3🟢🟢", { token, resource });

    await prisma.token.update({
      data: { chatMessageId: resource.id },
      where: { id: token.id },
    });
    console.log("🟢🟢UpsertChatMessage 4🟢🟢", { token, resource });
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
    console.log("🟢🟢UpsertChatMessage ERROR🟢🟢", e);
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
