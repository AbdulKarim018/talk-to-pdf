import { z } from "zod";

export const messageSchema = z.object({
  content: z.string().min(1),
  role: z.enum(["user", "assistant", "system"]),
});
