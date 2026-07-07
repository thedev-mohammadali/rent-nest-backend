import { z } from "zod";

export const createPropertyListingSchema = z.object({
  title: z
    .string("Title is required")
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title cannot exceed 200 characters"),

  description: z
    .string("Description is required")
    .trim()
    .min(20, "Description must be at least 20 characters"),

  rent: z.number("Rent is required").positive("Rent must be greater than 0"),

  location: z
    .string("Location is required")
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location cannot exceed 100 characters"),

  amenities: z.array(z.string().trim()).optional(),

  bedrooms: z
    .number()
    .int("Bedrooms must be a whole number")
    .positive("Bedrooms must be greater than 0")
    .optional(),

  bathrooms: z
    .number()
    .int("Bathrooms must be a whole number")
    .positive("Bathrooms must be greater than 0")
    .optional(),

  size: z.number().positive("Size must be greater than 0").optional(),

  images: z.array(z.url("Image must be a valid URL")).optional(),

  categoryId: z.uuid({
    error: (issue) =>
      issue.input == null ? "Category is required" : "Invalid category id",
  }),
});

export type CreatePropertyListingPayload = z.infer<
  typeof createPropertyListingSchema
>;
