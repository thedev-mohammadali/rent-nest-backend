import status from "http-status";
import { getPagination } from "../../common/query/pagination";
import { PropertyWhereInput } from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";

import { GetPropertiesQuery } from "./property.interface";
import {
  CreatePropertyPayload,
  UpdatePropertyPayload,
} from "./property.validation";

const SORT_ORDERS = ["asc", "desc"] as const;

const getMyProperties = async (
  landlordId: string,
  query: GetPropertiesQuery,
) => {
  const limit = Math.max(1, Number(query.limit) || 10);
  const page = Math.max(1, Number(query.page) || 1);
  const skip = (page - 1) * limit;

  const SORTABLE_FIELDS = ["createdAt", "rent", "title", "updatedAt"] as const;

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

const createProperty = async (
  landlordId: string,
  payload: CreatePropertyPayload,
) => {
  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new AppError(status.BAD_REQUEST, "Category not found");
  }

  return prisma.property.create({
    data: {
      landlordId,
      ...payload,
    },
  });
};

const updateProperty = async (
  propertyId: string,
  landlordId: string,
  payload: UpdatePropertyPayload,
) => {
  const existingProperty = await prisma.property.findFirst({
    where: {
      id: propertyId,
      landlordId,
    },
  });

  if (!existingProperty) {
    throw new AppError(status.NOT_FOUND, "Property not found");
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: payload.categoryId,
      },
    });

    if (!category) {
      throw new AppError(status.BAD_REQUEST, "Category not found");
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

const deleteProperty = async (propertyId: string, landlordId: string) => {
  const existingProperty = await prisma.property.findFirst({
    where: {
      id: propertyId,
      landlordId,
    },
  });

  if (!existingProperty) {
    throw new AppError(status.NOT_FOUND, "Property not found");
  }

  await prisma.property.delete({
    where: {
      id: propertyId,
      landlordId,
    },
  });
};

const getMyPropertyById = async (propertyId: string, landlordId: string) => {
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      landlordId,
    },
  });

  if (!property) {
    throw new AppError(status.NOT_FOUND, "Property not found");
  }

  return property;
};

const updatePropertyAvailability = async (
  propertyId: string,
  landlordId: string,
) => {
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      landlordId,
    },
  });

  if (!property) {
    throw new AppError(status.NOT_FOUND, "Property not found");
  }

  const updateAvailabilityStatus = !property.isAvailable;

  return prisma.property.update({
    where: {
      id: propertyId,
      landlordId,
    },
    data: {
      isAvailable: updateAvailabilityStatus,
    },
    select: {
      isAvailable: true,
    },
  });
};

const getAvailableProperties = async (query: GetPropertiesQuery) => {
  const page = Number(query.page);
  const limit = Number(query.limit);

  const pagination = getPagination(page, limit);

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
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: pagination.limit,
    skip: pagination.skip,
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
      page: pagination.page,
      limit: pagination.limit,
      total: totalProperties,
      totalPages: Math.ceil(totalProperties / pagination.limit),
    },
    properties,
  };
};

const getPropertyById = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
      isAvailable: true,
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
  getMyProperties,
  getMyPropertyById,
  deleteProperty,
  updateProperty,
  createProperty,
  updatePropertyAvailability,
};
