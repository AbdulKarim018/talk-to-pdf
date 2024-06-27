import { env } from "@/env";
import OpenAI from "openai";

export const getOpenAIClient = () => {
  const openai = new OpenAI({
    apiKey: env.HF_AI_API_KEY,
    baseURL: env.CHAT_AI_API_URL,
  });
  return openai;
};
