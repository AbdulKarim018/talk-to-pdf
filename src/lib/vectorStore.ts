import { env } from "@/env";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { getEmbeddingsClient } from "./embedding";

export const getVectorStore = async () => {
  const pinecone = new Pinecone({
    apiKey: env.PINECONE_API_KEY,
  });

  const pineconeIndex = pinecone.Index(env.PINECONE_INDEX);

  const vectorStore = await PineconeStore.fromExistingIndex(
    getEmbeddingsClient(),
    {
      pineconeIndex,
      namespace: "pdf",
    },
  );

  return vectorStore;
};
