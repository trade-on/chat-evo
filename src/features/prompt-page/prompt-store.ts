import { proxy, useSnapshot } from "valtio";
import { RevalidateCache } from "../common/navigation-helpers";
import { ServerActionResponse } from "../common/server-action-response";
import { CreatePrompt, UpsertPrompt } from "./prompt-service";
import { Prompt } from "@prisma/client";

class PromptState {
  private defaultModel: Prompt = {
    id: "",
    name: "",
    description: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    isPublished: false,
    userId: "",
    category: "user",
  };

  public errors: string[] = [];
  public prompt: Prompt = { ...this.defaultModel };
  public isOpened: boolean = false;

  public newPrompt() {
    this.prompt = {
      ...this.defaultModel,
    };
    this.isOpened = true;
  }

  public updateOpened(value: boolean) {
    this.isOpened = value;
  }

  public updatePrompt(prompt: Prompt) {
    this.prompt = {
      ...prompt,
    };
    this.isOpened = true;
  }

  public updateErrors(errors: string[]) {
    this.errors = errors;
  }
}

export const promptStore = proxy(new PromptState());

export const usePromptState = () => {
  return useSnapshot(promptStore, {
    sync: true,
  });
};

export const addOrUpdatePrompt = async (
  previous: any,
  formData: FormData
): Promise<ServerActionResponse<Prompt>> => {
  promptStore.updateErrors([]);

  const model = FormDataToPromptModel(formData);

  const response =
    model.id && model.id !== ""
      ? await UpsertPrompt(model)
      : await CreatePrompt(model);

  if (response.status === "OK") {
    promptStore.updateOpened(false);
    RevalidateCache({
      page: "prompt",
    });
  } else {
    promptStore.updateErrors(response.errors.map((e) => e.message));
  }
  return response;
};

export const FormDataToPromptModel = (formData: FormData): Prompt => {
  return {
    id: formData.get("id") as string,
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    isPublished: formData.get("isPublished") === "on" ? true : false,
    userId: "", // the user id is set on the server once the user is authenticated
    createdAt: new Date(),
    updatedAt: new Date(),
    category: "user",
  };
};
