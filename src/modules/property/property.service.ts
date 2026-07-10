import status from "http-status";
import { PropertyWhereInput } from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { GetPropertiesQuery } from "./property.interface";

const getAvailableProperties = async (query: GetPropertiesQuery) => {
  const limit = Math.max(1, Number(query.limit) || 10);
  const page = Math.max(1, Number(query.page) || 1);
  const skip = (page - 1) * limit;

  const SORTABLE_FIELDS = ["createdAt", "rent", "title", "updatedAt"] as const;

  const sortBy =
    query.sortBy && SORTABLE_FIELDS.includes(query.sortBy)
      ? query.sortBy
      : "createdAt";

  const SORT_ORDERS = ["asc", "desc"] as const;

  const sortOrder =
    query.sortOrder && SORT_ORDERS.includes(query.sortOrder)
      ? query.sortOrder
      : "desc";

  const { categoryId, location, search, minRent, maxRent } = query;

  const andCondition: PropertyWhereInput[] = [];

  if (categoryId) {
    andCondition.push({
      categoryId,
    });
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
  const properties = await prisma.property.findMany({
    where: {
      isAvailable: true,
      AND: andCondition,
    },
    include: {
      reviews: true,
    },
  });

  const totalProperties = await prisma.property.count({
    where: {
      isAvailable: true,
      AND: andCondition,
    },
  });

  return {
    meta: {
      page,
      limit,
      total: totalProperties,
      totalPages: Math.ceil(totalProperties / limit),
    },
    properties,
  };
};

const getPropertyById = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    include: {
      reviews: true,
    },
  });

  if (!property) {
    throw new AppError(status.NOT_FOUND, "Property not found");
  }

  return property;
};

export const propertyService = {
  getAvailableProperties,
  getPropertyById,
};
