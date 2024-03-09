import { OpenAI } from "openai";

export const OpenAIInstance = (model: "35" | "4" = "4") => {
  const openai = new OpenAI({
    apiKey: process.env[`AZURE_OPENAI_API_KEY_${model}`],
    baseURL: `https://${
      process.env[`AZURE_OPENAI_API_INSTANCE_NAME_${model}`]
    }.openai.azure.com/openai/deployments/${
      process.env[`AZURE_OPENAI_API_DEPLOYMENT_NAME_${model}`]
    }`,
    defaultQuery: {
      "api-version": process.env[`AZURE_OPENAI_API_VERSION_${model}`],
    },
    defaultHeaders: { "api-key": process.env[`AZURE_OPENAI_API_KEY_${model}`] },
  });
  return openai;
};

export const OpenAIEmbeddingInstance = (model: "35" | "4" = "4") => {
  if (
    !process.env[`AZURE_OPENAI_API_KEY_${model}`] ||
    !process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME ||
    !process.env.AZURE_OPENAI_API_INSTANCE_NAME
  ) {
    throw new Error(
      "Azure OpenAI Embeddings endpoint config is not set, check environment variables."
    );
  }

  const openai = new OpenAI({
    apiKey: process.env[`AZURE_OPENAI_API_KEY_${model}`],
    baseURL: `https://${process.env.AZURE_OPENAI_API_INSTANCE_NAME}.openai.azure.com/openai/deployments/${process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME}`,
    defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
    defaultHeaders: { "api-key": process.env[`AZURE_OPENAI_API_KEY_${model}`] },
  });
  return openai;
};

// a new instance definition for DALL-E image generation
export const OpenAIDALLEInstance = () => {
  if (
    !process.env.AZURE_OPENAI_DALLE_API_KEY ||
    !process.env.AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME ||
    !process.env.AZURE_OPENAI_DALLE_API_INSTANCE_NAME
  ) {
    throw new Error(
      "Azure OpenAI DALLE endpoint config is not set, check environment variables."
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_DALLE_API_KEY,
    baseURL: `https://${process.env.AZURE_OPENAI_DALLE_API_INSTANCE_NAME}.openai.azure.com/openai/deployments/${process.env.AZURE_OPENAI_DALLE_API_DEPLOYMENT_NAME}`,
    defaultQuery: {
      "api-version":
        process.env.AZURE_OPENAI_DALLE_API_VERSION || "2023-12-01-preview",
    },
    defaultHeaders: {
      "api-key": process.env.AZURE_OPENAI_DALLE_API_KEY,
    },
  });
  return openai;
};

export const OpenAIVisionInstance = () => {
  if (
    !process.env.AZURE_OPENAI_VISION_API_KEY ||
    !process.env.AZURE_OPENAI_VISION_API_DEPLOYMENT_NAME ||
    !process.env.AZURE_OPENAI_VISION_API_INSTANCE_NAME ||
    !process.env.AZURE_OPENAI_VISION_API_VERSION
  ) {
    throw new Error(
      "Azure OpenAI Vision environment config is not set, check environment variables."
    );
  }

  const openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_VISION_API_KEY,
    baseURL: `https://${process.env.AZURE_OPENAI_VISION_API_INSTANCE_NAME}.openai.azure.com/openai/deployments/${process.env.AZURE_OPENAI_VISION_API_DEPLOYMENT_NAME}`,
    defaultQuery: {
      "api-version": process.env.AZURE_OPENAI_VISION_API_VERSION,
    },
    defaultHeaders: { "api-key": process.env.AZURE_OPENAI_VISION_API_KEY },
  });
  return openai;
};
