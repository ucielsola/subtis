import { z } from "zod";

export const cinemasSchema = z.object({
  link: z.string(),
  cinemas: z.record(z.array(z.object({ city: z.string(), name: z.string() }))),
});
