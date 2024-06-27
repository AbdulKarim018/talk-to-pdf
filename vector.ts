import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const embeddingsClient = new HuggingFaceInferenceEmbeddings({
  endpointUrl: process.env.EMBEDDING_MODEL_API_URL,
  model: "mixedbread-ai/mxbai-embed-large-v1",
  apiKey: process.env.HF_AI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const pineconeIndex = pinecone.Index("dev");

const store = await PineconeStore.fromExistingIndex(embeddingsClient, {
  pineconeIndex,
  namespace: "pdf",
});

const results = await store.similaritySearch("do-while", 5);

await store.delete({
  deleteAll: true,
});

console.log("deleted everything");
