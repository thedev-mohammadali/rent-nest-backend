import status from "http-status";
import { PropertyWhereInput } from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { GetPropertyListingsQuery } from "./landlord.interface";
import {
  CreatePropertyListingPayload,
  UpdatePropertyListingPayload,
} from "./landlord.validate";

const SORTABLE_FIELDS = ["createdAt", "rent", "title", "updatedAt"] as const;
const SORT_ORDERS = ["asc", "desc"] as const;

const getMyProperties = async (
  landlordId: string,
  query: GetPropertyListingsQuery,
) => {
  const limit = Math.max(1, Number(query.page) || 1);
  const page = Math.max(1, Number(query.limit) || 10);
  const skip = (page - 1) * limit;

  const sortBy =
    query.sortBy && SORTABLE_FIELDS.includes(query.sortBy)
      ? query.sortBy
      : "createdAt";

  const sortOrder =
    query.sortOrder && SORT_ORDERS.includes(query.sortOrder)
      ? query.sortOrder
      : "desc";

  const { categoryId, isAvailable, location, search, minRent, maxRent } = query;

  const andCondition: PropertyWhereInput[] = [];

  if (categoryId) {
    andCondition.push({
      categoryId,
    });
  }

  if (typeof isAvailable !== "undefined") {
    andCondition.push({ isAvailable: isAvailable === "true" ? true : false });
  }

  if (location) {
    andCondition.push({
      location: {
        contains: location,
        mode: "insensitive",
      },
    });
  }

  if (minRent) {
    andCondition.push({
      rent: {
        gte: Number(minRent),
      },
    });
  }

  if (maxRent) {
    andCondition.push({
      rent: {
        lte: Number(maxRent),
      },
    });
  }

  if (search) {
    andCondition.push({
      OR: [
        {
          location: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          category: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  const listings = await prisma.property.findMany({
    where: {
      landlordId,
      AND: andCondition,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    omit: {
      categoryId: true,
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
      AND: andCondition,
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
