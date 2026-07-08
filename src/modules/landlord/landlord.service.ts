import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import {
  CreatePropertyListingPayload,
  UpdatePropertyListingPayload,
} from "./landlord.validate";

const getMyProperties = async (landlordId: string) => {
  return prisma.property.findMany({
    where: {
      landlordId,
    },
  });
};

const createPropertyListing = async (
  landlordId: string,
  payload: CreatePropertyListingPayload,
) => {
  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new AppError(status.BAD_REQUEST, "Category not found", null);
  }

  return prisma.property.create({
    data: {
      landlordId,
      ...payload,
    },
  });
};

const editPropertyListing = async (
  propertyId: string,
  landlordId: string,
  payload: UpdatePropertyListingPayload,
) => {
  const existingProperty = await prisma.property.findFirst({
    where: {
      id: propertyId,
      landlordId,
    },
  });

  if (!existingProperty) {
    throw new AppError(status.NOT_FOUND, "Property not found", null);
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: payload.categoryId,
      },
    });

    if (!category) {
      throw new AppError(status.BAD_REQUEST, "Category not found", null);
    }
  }

  return prisma.property.update({
    where: {
      id: propertyId,
      landlordId,
    },
    data: payload,
  });
};

export const landlordService = {
  createPropertyListing,
  editPropertyListing,
  getMyProperties,
};
