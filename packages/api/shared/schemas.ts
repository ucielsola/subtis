import { z } from "zod";

// schemas
export const errorSchema = z.object({ message: z.string() });
