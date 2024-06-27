import { env } from "@/env";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

export const getEmbeddingsClient = () => {
  const embeddingsClient = new HuggingFaceInferenceEmbeddings({
    endpointUrl: env.EMBEDDING_MODEL_API_URL,
    model: "mixedbread-ai/mxbai-embed-large-v1",
    apiKey: env.HF_AI_API_KEY,
  });
  return embeddingsClient;
};
