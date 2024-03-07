"use client";
import { uniqueId } from "@/features/common/util";
import { showError } from "@/features/globals/global-message-store";
import { AI_NAME, NEW_CHAT_NAME } from "@/features/theme/theme-config";
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from "eventsource-parser";
import { FormEvent } from "react";
import { proxy, useSnapshot } from "valtio";
import { RevalidateCache } from "../common/navigation-helpers";
import { InputImageStore } from "../ui/chat/chat-input-area/input-image-store";
import { textToSpeechStore } from "./chat-input/speech/use-text-to-speech";
import { ResetInputRows } from "./chat-input/use-chat-input-dynamic-height";
import { UpdateChatTitle } from "./chat-services/chat-thread-service";
import { AzureChatCompletion } from "./chat-services/models";
import { ChatMessage, ChatThread } from "@prisma/client";
import { getCurrentUser } from "../auth-page/helpers";
let abortController: AbortController = new AbortController();

type chatStatus = "idle" | "loading" | "file upload";

class ChatState {
  public messages: Array<ChatMessage> = [];
  public loading: chatStatus = "idle";
  public input: string = "";
  public lastMessage: string = "";
  public autoScroll: boolean = false;
  public userName: string = "";
  public chatThreadId: string = "";

  private chatThread: ChatThread | undefined;

  private addToMessages(message: ChatMessage) {
    const currentMessage = this.messages.find((el) => el.id === message.id);
    if (currentMessage) {
      currentMessage.content = message.content;
    } else {
      this.messages.push(message);
    }
  }

  private removeMessage(id: string) {
    const index = this.messages.findIndex((el) => el.id === id);
    if (index > -1) {
      this.messages.splice(index, 1);
    }
  }

  public updateLoading(value: chatStatus) {
    this.loading = value;
  }

  public initChatSession({
    userName,
    messages,
    chatThread,
  }: {
    chatThread: ChatThread;
    userName: string;
    messages: Array<ChatMessage>;
  }) {
    this.chatThread = chatThread;
    this.chatThreadId = chatThread.id;
    this.messages = messages;
    this.userName = userName;
  }

  public updateInput(value: string) {
    this.input = value;
  }

  public stopGeneratingMessages() {
    abortController.abort();
  }

  public updateAutoScroll(value: boolean) {
    this.autoScroll = value;
  }

  private reset() {
    this.input = "";
    ResetInputRows();
    InputImageStore.Reset();
  }

  private async chat(formData: FormData) {
    this.updateAutoScroll(true);
    this.loading = "loading";

    const multimodalImage = formData.get("image-base64") as unknown as string;
    const user = await getCurrentUser();
    const newUserMessage: ChatMessage = {
      role: "user",
      content: this.input,
      multiModalImage: multimodalImage,
      createdAt: new Date(),
      isDeleted: false,
      threadId: this.chatThreadId,
      userId: user.id,
      name: user.name ?? null,
      id: "",
      updatedAt: new Date(),
    };

    this.messages.push(newUserMessage);
    this.reset();

    const controller = new AbortController();
    abortController = controller;

    try {
      if (this.chatThreadId === "" || this.chatThreadId === undefined) {
        showError("Chat thread ID is empty");
        return;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const responseType = JSON.parse(event.data) as AzureChatCompletion;
          switch (responseType.type) {
            case "functionCall":
              const mappedFunction: ChatMessage = {
                id: uniqueId(),
                content: responseType.response.arguments,
                name: responseType.response.name,
                role: "function",
                createdAt: new Date(),
                isDeleted: false,
                threadId: this.chatThreadId,
                userId: null,
                multiModalImage: null,
                updatedAt: new Date(),
              };
              this.addToMessages(mappedFunction);
              break;
            case "functionCallResult":
              const mappedFunctionResult: ChatMessage = {
                id: uniqueId(),
                content: responseType.response,
                name: "tool",
                role: "tool",
                createdAt: new Date(),
                isDeleted: false,
                threadId: this.chatThreadId,
                userId: "",
                multiModalImage: "",
                updatedAt: new Date(),
              };
              this.addToMessages(mappedFunctionResult);
              break;
            case "content":
              const mappedContent: ChatMessage = {
                id: responseType.response.id,
                content: responseType.response.choices[0].message.content || "",
                name: AI_NAME,
                role: "assistant",
                createdAt: new Date(),
                isDeleted: false,
                threadId: this.chatThreadId,
                userId: null,
                multiModalImage: null,
                updatedAt: new Date(),
              };

              this.addToMessages(mappedContent);
              this.lastMessage = mappedContent.content;

              break;
            case "abort":
              this.removeMessage(newUserMessage.id);
              this.loading = "idle";
              break;
            case "error":
              showError(responseType.response);
              this.loading = "idle";
              break;
            case "finalContent":
              this.loading = "idle";
              this.completed(this.lastMessage);
              this.updateTitle();
              break;
            default:
              break;
          }
        }
      };

      if (response.body) {
        const parser = createParser(onParse);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;

          const chunkValue = decoder.decode(value);
          parser.feed(chunkValue);
        }
        this.loading = "idle";
      }
    } catch (error) {
      showError("" + error);
      this.loading = "idle";
    }
  }

  private async updateTitle() {
    if (this.chatThread && this.chatThread.title === NEW_CHAT_NAME) {
      await UpdateChatTitle(this.chatThreadId, this.messages[0].content);
      RevalidateCache({
        page: "chat",
        type: "layout",
      });
    }
  }

  private completed(message: string) {
    textToSpeechStore.speak(message);
  }

  public async submitChat(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (this.input === "" || this.loading !== "idle") {
      return;
    }

    // get form data from e
    const formData = new FormData(e.currentTarget);

    const body = JSON.stringify({
      id: this.chatThreadId,
      message: this.input,
    });
    formData.append("content", body);

    this.chat(formData);
  }
}

export const chatStore = proxy(new ChatState());

export const useChat = () => {
  return useSnapshot(chatStore, { sync: true });
};
