"use server";
import "server-only";

import { getCurrentUser } from "@/features/auth-page/helpers";
import { CHAT_DEFAULT_SYSTEM_PROMPT } from "@/features/theme/theme-config";
import { ChatCompletionStreamingRunner } from "openai/resources/beta/chat/completions";
import { ChatApiRAG } from "../chat-api/chat-api-rag";
import { FindAllChatDocuments } from "../chat-document-service";
import {
  CreateChatMessage,
  FindTopChatMessagesForCurrentUser,
} from "../chat-message-service";
import { EnsureChatThreadOperation } from "../chat-thread-service";
import { UserPrompt } from "../models";
import { mapOpenAIChatMessages } from "../utils";
import { GetDefaultExtensions } from "./chat-api-default-extensions";
import { GetDynamicExtensions } from "./chat-api-dynamic-extensions";
import { ChatApiExtensions } from "./chat-api-extension";
import { ChatApiMultimodal } from "./chat-api-multimodal";
import { OpenAIStream } from "./open-ai-stream";
import { ChatThread } from "@prisma/client";
type ChatTypes = "extensions" | "chat-with-file" | "multimodal";

export const ChatAPIEntry = async (props: UserPrompt, signal: AbortSignal) => {
  const currentChatThreadResponse = await EnsureChatThreadOperation(props.id);

  if (currentChatThreadResponse.status !== "OK") {
    return new Response("", { status: 401 });
  }

  const currentChatThread = currentChatThreadResponse.response;

  // promise all to get user, history and docs
  const [user, history, /* docs,*/ extension] = await Promise.all([
    getCurrentUser(),
    _getHistory(currentChatThread),
    // _getDocuments(currentChatThread),
    _getExtensions({
      chatThread: currentChatThread,
      userMessage: props.message,
      signal,
    }),
  ]);
  // Starting values for system and user prompt
  // Note that the system message will also get prepended with the extension execution steps. Please see ChatApiExtensions method.
  const docs = [];
  let chatType: ChatTypes = "extensions";

  if (props.multimodalImage && props.multimodalImage.length > 0) {
    chatType = "multimodal";
  } else if (docs.length > 0) {
    chatType = "chat-with-file";
  } else if (extension.length > 0) {
    chatType = "extensions";
  }
  // save the user message
  const createdMessage = await CreateChatMessage({
    userId: user.id,
    content: props.message,
    role: "user",
    threadId: currentChatThread.id,
    multiModalImage: props.multimodalImage,
    isDeleted: false,
    name: user.displayName ?? null,
  });
  console.log("🟢 ChatAPIEntry -> createdMessage", createdMessage);

  let runner: ChatCompletionStreamingRunner;

  switch (chatType) {
    case "chat-with-file":
      runner = await ChatApiRAG({
        chatThread: currentChatThread,
        userMessage: props.message,
        history: history,
        signal: signal,
      });
      break;
    case "multimodal":
      runner = ChatApiMultimodal({
        chatThread: currentChatThread,
        userMessage: props.message,
        file: props.multimodalImage,
        signal: signal,
      });
      break;
    case "extensions":
      runner = await ChatApiExtensions({
        chatThread: currentChatThread,
        userMessage: props.message,
        history: history,
        extensions: extension,
        signal: signal,
      });
      break;
  }
  console.log("🟢 ChatAPIEntry after switch -> chatType", chatType);
  const readableStream = OpenAIStream({
    runner: runner,
    chatThread: currentChatThread,
  });
  console.log("🟢 ChatAPIEntry after switch -> readableStream", readableStream);

  return new Response(readableStream, {
    headers: {
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};

const _getHistory = async (chatThread: ChatThread) => {
  const historyResponse = await FindTopChatMessagesForCurrentUser(
    chatThread.id
  );

  if (historyResponse.status === "OK") {
    const historyResults = historyResponse.response;
    return mapOpenAIChatMessages(historyResults).reverse();
  }

  console.error("🔴 Error on getting history:", historyResponse.errors);

  return [];
};

const _getDocuments = async (chatThread: ChatThread) => {
  const docsResponse = await FindAllChatDocuments(chatThread.id);

  if (docsResponse.status === "OK") {
    return docsResponse.response;
  }

  console.error("🔴 Error on AI search:", docsResponse.errors);
  return [];
};

const _getExtensions = async (props: {
  chatThread: ChatThread;
  userMessage: string;
  signal: AbortSignal;
}) => {
  const extension: Array<any> = [];

  const response = await GetDefaultExtensions({
    chatThread: props.chatThread,
    userMessage: props.userMessage,
    signal: props.signal,
  });
  if (response.status === "OK" && response.response.length > 0) {
    extension.push(...response.response);
  }

  return extension;
};
