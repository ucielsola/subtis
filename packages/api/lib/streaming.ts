import { z } from "zod";

export const streamingSchema = z.object({
  name: z.string(),
  platforms: z.array(z.object({ name: z.string(), url: z.string(), type: z.string() })),
});
