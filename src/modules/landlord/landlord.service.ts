import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { CreatePropertyListingPayload } from "./landlord.validate";

const createPropertyListing = async (
  landlordId: string,
  payload: CreatePropertyListingPayload,
) => {
  const {
    title,
    rent,
    categoryId,
    description,
    location,
    amenities,
    bathrooms,
    bedrooms,
    images,
    size,
  } = payload;

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new AppError(status.BAD_REQUEST, "Category not found", null);
  }

  return prisma.property.create({
    data: {
      landlordId,
      title,
      categoryId,
      description,
      location,
      rent,
      size,
      amenities,
      bedrooms,
      bathrooms,
      images,
    },
  });
};

export const landlordService = {
  createPropertyListing,
};
