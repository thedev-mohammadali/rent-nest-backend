import {
  RentalRequestStatus,
  RentalStatus,
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
  sortBy?:
    | "leaseStartDate"
    | "leaseEndDate"
    | "createdAt"
    | "durationInMonths"
    | "requestedMoveInDate";
  sortOrder?: "asc" | "desc";
  status?: RentalRequestStatus;
  rentalStatus?: RentalStatus;
};
