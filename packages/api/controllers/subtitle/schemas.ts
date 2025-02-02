import { z } from "zod";

// lib
import { subtitleSchema } from "../../lib/schemas";

// schemas
export const alternativeSubtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: "Alternative subtitles not found for file" })
  .min(1, { message: "Alternative subtitles not found for file" });
