"use server";

import {
  ServerActionResponse,
  zodErrorsToServerActionErrors,
} from "@/features/common/server-action-response";
import {
  PROMPT_ATTRIBUTE,
  PromptModelSchema,
} from "@/features/prompt-page/models";
import { getCurrentUser, userHashedId } from "../auth-page/helpers";
import { Prompt } from "@prisma/client";
import { prisma } from "../common/services/sql";

export const CreatePrompt = async (
  props: Prompt
): Promise<ServerActionResponse<Prompt>> => {
  try {
    const user = await getCurrentUser();

    if (user.role !== "admin") {
      return {
        status: "UNAUTHORIZED",
        errors: [
          {
            message: `Unable to create prompt`,
          },
        ],
      };
    }

    const modelToSave: Omit<Prompt, "id" | "createdAt" | "updatedAt"> = {
      name: props.name,
      description: props.description,
      isPublished: user.role === "admin" ? props.isPublished : false,
      userId: await userHashedId(),
    };

    const valid = ValidateSchema(modelToSave);

    if (valid.status !== "OK") {
      return valid;
    }

    const resource = await prisma.prompt.create({ data: modelToSave });

    if (resource) {
      return {
        status: "OK",
        response: resource,
      };
    } else {
      return {
        status: "ERROR",
        errors: [
          {
            message: "Error creating prompt",
          },
        ],
      };
    }
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error creating prompt: ${error}`,
        },
      ],
    };
  }
};

export const FindAllPrompts = async (): Promise<
  ServerActionResponse<Array<Prompt>>
> => {
  try {
    const resources = await prisma.prompt.findMany({
      where: { userId: await userHashedId() },
    });

    return {
      status: "OK",
      response: resources,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error retrieving prompt: ${error}`,
        },
      ],
    };
  }
};

export const EnsurePromptOperation = async (
  promptId: string
): Promise<ServerActionResponse<Prompt>> => {
  const promptResponse = await FindPromptByID(promptId);
  const currentUser = await getCurrentUser();

  if (promptResponse.status === "OK") {
    if (currentUser.role === "admin") {
      return promptResponse;
    }
  }

  return {
    status: "UNAUTHORIZED",
    errors: [
      {
        message: `Prompt not found with id: ${promptId}`,
      },
    ],
  };
};

export const DeletePrompt = async (
  promptId: string
): Promise<ServerActionResponse<Prompt>> => {
  try {
    const promptResponse = await EnsurePromptOperation(promptId);

    if (promptResponse.status === "OK") {
      const deletedPrompt = await prisma.prompt.delete({
        where: { id: promptId },
      });

      return {
        status: "OK",
        response: deletedPrompt,
      };
    }

    return promptResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error deleting prompt: ${error}`,
        },
      ],
    };
  }
};

export const FindPromptByID = async (
  id: string
): Promise<ServerActionResponse<Prompt>> => {
  try {
    const resource = await prisma.prompt.findUnique({
      where: { id },
    });

    if (!resource) {
      return {
        status: "NOT_FOUND",
        errors: [
          {
            message: "Prompt not found",
          },
        ],
      };
    }

    return {
      status: "OK",
      response: resource,
    };
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error finding prompt: ${error}`,
        },
      ],
    };
  }
};

export const UpsertPrompt = async (
  promptInput: Omit<Prompt, "createdAt" | "updatedAt">
): Promise<ServerActionResponse<Prompt>> => {
  try {
    const promptResponse = await EnsurePromptOperation(promptInput.id);

    if (promptResponse.status === "OK") {
      const { response: prompt } = promptResponse;
      const user = await getCurrentUser();

      const modelToUpdate: Prompt = {
        ...prompt,
        name: promptInput.name,
        description: promptInput.description,
        isPublished:
          user.role === "admin" ? promptInput.isPublished : prompt.isPublished,
        createdAt: new Date(),
      };

      const validationResponse = ValidateSchema(modelToUpdate);
      if (validationResponse.status !== "OK") {
        return validationResponse;
      }
      const resource = await prisma.prompt.update({
        where: { id: modelToUpdate.id },
        data: modelToUpdate,
      });

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
            message: "Error updating prompt",
          },
        ],
      };
    }

    return promptResponse;
  } catch (error) {
    return {
      status: "ERROR",
      errors: [
        {
          message: `Error updating prompt: ${error}`,
        },
      ],
    };
  }
};

const ValidateSchema = (
  model: Omit<Prompt, "id" | "createdAt" | "updatedAt">
): ServerActionResponse => {
  const validatedFields = PromptModelSchema.safeParse(model);

  if (!validatedFields.success) {
    return {
      status: "ERROR",
      errors: zodErrorsToServerActionErrors(validatedFields.error.errors),
    };
  }

  return {
    status: "OK",
    response: model,
  };
};
