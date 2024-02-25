"use server";
import "server-only";

import { OpenAIInstance } from "@/features/common/services/openai";
import { RunnableToolFunction } from "openai/lib/RunnableFunction";
import { ChatCompletionStreamingRunner } from "openai/resources/beta/chat/completions";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { ChatThreadModel } from "../models";
import { CHAT_DEFAULT_SYSTEM_PROMPT } from "@/features/theme/theme-config";
export const ChatApiExtensions = async (props: {
  chatThread: ChatThreadModel;
  userMessage: string;
  history: ChatCompletionMessageParam[];
  extensions: RunnableToolFunction<any>[];
  signal: AbortSignal;
}): Promise<ChatCompletionStreamingRunner> => {
  const { userMessage, history, signal } = props;

  const openAI = OpenAIInstance();
  return openAI.beta.chat.completions.runTools(
    {
      model: "",
      stream: true,
      messages: [
        {
          role: "system",
          content: CHAT_DEFAULT_SYSTEM_PROMPT,
        },
        ...history,
        {
          role: "user",
          content: userMessage,
        },
      ],
      tools: [],
    },
    { signal: signal }
  );
};
