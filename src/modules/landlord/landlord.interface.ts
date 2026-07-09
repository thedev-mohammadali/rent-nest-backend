import {
  RentalAgreementStatus,
  RentalRequestStatus,
} from "../../generated/prisma/enums";

export type GetPropertyListingsQuery = {
  page?: string;
  limit?: string;
  sortBy?: "title" | "rent" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  isAvailable?: string;
  location?: string;
  categoryId?: string;
  minRent?: string;
  maxRent?: string;
  search?: string;
};

export type GetRentalRequestsQuery = {
  page?: string;
  limit?: string;
  sortBy?: "createdAt" | "durationInMonths" | "requestedMoveInDate";
  sortOrder?: "asc" | "desc";
  status?: RentalRequestStatus;
};

export type GetRentalAgreementsQuery = {
  page?: string;
  limit?: string;
  sortBy?: "createdAt" | "leaseStartDate" | "leaseEndDate";
  sortOrder?: "asc" | "desc";
  status?: RentalAgreementStatus;
};
