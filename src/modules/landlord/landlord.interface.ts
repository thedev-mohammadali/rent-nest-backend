export type GetPropertyListingsQuery = {
  page?: number;
  limit?: number;
  sortBy?: "title" | "rent" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  isAvailable?: boolean;
  location?: string;
  categoryId?: string;
  minRent?: number;
  maxRent?: number;
  search?: string;
};
