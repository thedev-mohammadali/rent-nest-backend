import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { GetPropertyListingsQuery } from "./landlord.interface";
import {
  CreatePropertyListingPayload,
  UpdatePropertyListingPayload,
} from "./landlord.validate";

const getMyProperties = async (
  landlordId: string,
  query: GetPropertyListingsQuery,
) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const listings = await prisma.property.findMany({
    where: {
      AND: [{ landlordId }],
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: limit,
    skip,
  });

  const propertyCount = await prisma.property.count({
    where: {
      landlordId,
    },
  });

  return {
    meta: {
      page,
      limit,
      total: propertyCount,
      totalPages: Math.ceil(propertyCount / limit),
    },
    listings,
  };
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
