import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionFunctionMessageParam,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { ChatMessageModel } from "./models";
import { ChatMessage } from "@prisma/client";

export const mapOpenAIChatMessages = (
  messages: ChatMessage[]
): ChatCompletionMessageParam[] => {
  return messages.map((message) => {
    switch (message.role) {
      case "function":
        return {
          role: message.role,
          name: message.name,
          content: message.content,
        } as ChatCompletionFunctionMessageParam;
      case "assistant":
        return {
          role: message.role,
          content: message.content,
        } as ChatCompletionAssistantMessageParam;
      default:
        return {
          role: message.role,
          content: message.content,
        } as ChatCompletionMessageParam;
    }
  });
};
