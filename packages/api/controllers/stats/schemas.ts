import { z } from "zod";

export const statsSchema = z.object({
  total_titles: z.number(),
  total_subtitles: z.number(),
  total_queried_times: z.number(),
});
