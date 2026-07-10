import { RentalAgreementStatus } from "../../generated/prisma/enums";

export type GetRentalAgreementsQuery = {
  page?: string;
  limit?: string;
  sortBy?: "createdAt" | "leaseStartDate" | "leaseEndDate";
  sortOrder?: "asc" | "desc";
  status?: RentalAgreementStatus;
};
