import { AI_NAME } from "@/features/theme/theme-config";
import { ChatCompletionStreamingRunner } from "openai/resources/beta/chat/completions";
import { CreateChatMessage } from "../chat-message-service";
import { AzureChatCompletion, AzureChatCompletionAbort } from "../models";
import { ChatThread } from "@prisma/client";
import { getCurrentUser, userSession } from "@/features/auth-page/helpers";

export const OpenAIStream = (props: {
  runner: ChatCompletionStreamingRunner;
  chatThread: ChatThread;
  tenantId: string;
}) => {
  const encoder = new TextEncoder();

  const { runner, chatThread } = props;

  const readableStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const streamResponse = (event: string, value: string) => {
        controller.enqueue(encoder.encode(`event: ${event} \n`));
        controller.enqueue(encoder.encode(`data: ${value} \n\n`));
      };

      let lastMessage = "";

      runner
        .on("content", (content) => {
          const completion = runner.currentChatCompletionSnapshot;

          if (completion) {
            const response: AzureChatCompletion = {
              type: "content",
              response: completion,
            };
            lastMessage = completion.choices[0].message.content ?? "";
            streamResponse(response.type, JSON.stringify(response));
          }
        })
        .on("functionCall", async (functionCall) => {
          await CreateChatMessage({
            name: functionCall.name,
            content: functionCall.arguments,
            role: "function",
            threadId: chatThread.id,
            isDeleted: false,
            userId: null,
            multiModalImage: null,
            tenantId: props.tenantId,
            ioType: "OUTPUT",
            model: "GPT35",
          });

          const response: AzureChatCompletion = {
            type: "functionCall",
            response: functionCall,
          };
          streamResponse(response.type, JSON.stringify(response));
        })
        .on("functionCallResult", async (functionCallResult) => {
          const response: AzureChatCompletion = {
            type: "functionCallResult",
            response: functionCallResult,
          };
          await CreateChatMessage({
            name: "tool",
            content: functionCallResult,
            role: "function",
            threadId: chatThread.id,
            isDeleted: false,
            userId: null,
            multiModalImage: null,
            tenantId: props.tenantId,
            ioType: "OUTPUT",
            model: "GPT35",
          });
          streamResponse(response.type, JSON.stringify(response));
        })
        .on("abort", (error) => {
          const response: AzureChatCompletionAbort = {
            type: "abort",
            response: "Chat aborted",
          };
          streamResponse(response.type, JSON.stringify(response));
          controller.close();
        })
        .on("error", async (error) => {
          console.error("🔴 error", error);
          const response: AzureChatCompletion = {
            type: "error",
            response: error.message,
          };
          console.log("🟢 OpenAIStream at 2 -> lastMessage", lastMessage);

          // if there is an error still save the last message even though it is not complete
          await CreateChatMessage({
            name: AI_NAME,
            content: lastMessage,
            role: "assistant",
            threadId: props.chatThread.id,
            userId: null,
            multiModalImage: null,
            isDeleted: false,
            tenantId: props.tenantId,
            ioType: "OUTPUT",
            model: "GPT35",
          });

          streamResponse(response.type, JSON.stringify(response));
          controller.close();
        })
        .on("finalContent", async (content: string) => {
          await CreateChatMessage({
            name: AI_NAME,
            content: content,
            role: "assistant",
            threadId: props.chatThread.id,
            userId: null,
            multiModalImage: null,
            isDeleted: false,
            tenantId: props.tenantId,
            ioType: "OUTPUT",
            model: "GPT35",
          });

          const response: AzureChatCompletion = {
            type: "finalContent",
            response: content,
          };
          streamResponse(response.type, JSON.stringify(response));
          controller.close();
        });
    },
  });

  return readableStream;
};
