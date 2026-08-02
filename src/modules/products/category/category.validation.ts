import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255),
  parentId: z.string().uuid().optional(),
});
