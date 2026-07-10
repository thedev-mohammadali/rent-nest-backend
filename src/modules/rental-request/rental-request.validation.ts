import { z } from "zod";
import { RentalRequestStatus } from "../../generated/prisma/enums";

export const updateRentalRequestStatusSchema = z.object({
  status: z.enum([RentalRequestStatus.APPROVED, RentalRequestStatus.REJECTED], {
    error: (issue) =>
      issue.input == null
        ? "Status is required"
        : "Invalid status! Status can either be APPROVED or REJECTED",
  }),
});

export type UpdateRentalRequestStatus = z.infer<
  typeof updateRentalRequestStatusSchema
>;
