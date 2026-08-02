import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().optional(),
  email: z.email(),
  password: z.string().min(8),
});
