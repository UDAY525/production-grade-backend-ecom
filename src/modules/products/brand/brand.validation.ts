import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255),
  logoKey: z.string().optional(),
});
