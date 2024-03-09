"use server";
import "server-only";

import { OpenAIInstance } from "@/features/common/services/openai";
import { FindExtensionByID } from "@/features/extensions-page/extension-services/extension-service";
import { RunnableToolFunction } from "openai/lib/RunnableFunction";
import { ChatCompletionStreamingRunner } from "openai/resources/beta/chat/completions";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { ChatThread } from "@prisma/client";
export const ChatApiExtensions = async (props: {
  chatThread: ChatThread;
  userMessage: string;
  history: ChatCompletionMessageParam[];
  extensions: RunnableToolFunction<any>[];
  signal: AbortSignal;
}): Promise<ChatCompletionStreamingRunner> => {
  const { userMessage, history, signal, chatThread, extensions } = props;
  const openAI = OpenAIInstance();
  // const systemMessage = await extensionsSystemMessage(chatThread);
  console.log("🟢 ChatApiExtensions -> props", props);
  return openAI.beta.chat.completions.runTools(
    {
      model: "",
      stream: true,
      messages: [
        {
          role: "system",
          content: 'chatThread.personaMessage + "\n" + systemMessage',
        },
        ...history,
        {
          role: "user",
          content: userMessage,
        },
      ],
      tools: extensions,
    },
    { signal: signal }
  );
};

// const extensionsSystemMessage = async (chatThread: ChatThread) => {
//   let message = "";

//   for (const e of chatThread.extension) {
//     const extension = await FindExtensionByID(e);
//     if (extension.status === "OK") {
//       message += ` ${extension.response.executionSteps} \n`;
//     }
//   }

//   return message;
// };
