import { z } from "zod";
import { UserRole } from "../../generated/prisma/enums";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(255, "Name cannot exceed 255 characters"),

  email: z.email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password cannot exceed 255 characters"),

  role: z.enum([UserRole.TENANT, UserRole.LANDLORD]),
});

export const authValidation = {
  registerSchema,
};

export type RegisterPayload = z.infer<typeof registerSchema>;
