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
