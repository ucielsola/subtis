import { z } from "zod";

export const detailMessageSchema = z.object({
  total: z.number(),
  message: z.string(),
});

export const finalMessageSchema = z.object({
  ok: z.boolean(),
});
