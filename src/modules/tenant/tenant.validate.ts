import z from "zod";
import { RentalAgreementStatus } from "../../generated/prisma/enums";

export const submitRentalRequestSchema = z.object({
  propertyId: z.uuid({
    error: (issue) =>
      issue.input == null ? "Property ID is required" : "Invalid property ID",
  }),

  message: z.string().trim().min(3, "Message must be at least 3 characters"),

  requestedMoveInDate: z.coerce.date({
    error: (issue) =>
      issue.input == null ? "Date is requried" : "Invalid date",
  }),

  durationInMonths: z.coerce
    .number({
      error: (issue) =>
        issue.input == null
          ? "Duration in months is required"
          : "Invalid duration",
    })
    .int("Duration must be a whole number")
    .min(1, "Duration must be minimum 1 months")
    .max(36, "Duration cannot exceed 36 months"),
});

export const updateRentalAgreementStatusSchema = z.object({
  status: z.enum(
    [RentalAgreementStatus.TERMINATED, RentalAgreementStatus.COMPLETED],
    {
      error: (issue) =>
        issue.input == null
          ? "Status is required"
          : "Invalid status! Status can either be TERMINATED or COMPLETED",
    },
  ),
});

export type UpdateRentalAgreementStatus = z.infer<
  typeof updateRentalAgreementStatusSchema
>;

export type SubmitRentalRequestPayload = z.infer<
  typeof submitRentalRequestSchema
>;
