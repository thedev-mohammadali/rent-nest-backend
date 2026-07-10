import status from "http-status";
import { RentalRequestStatus, UserRole } from "../../generated/prisma/enums";
import {
  PropertyWhereInput,
  RentalRequestWhereInput,
  UserWhereInput,
} from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { isValidEnumValue } from "../../utils/validateEnum";
import {
  GetPropertyListingsQuery,
  GetRentalRequestsQuery,
} from "../landlord/landlord.interface";
import { GetUsersQuery } from "./admin.interface";
import { UpdateUserStatus } from "./admin.validate";

const SORT_ORDERS = ["asc", "desc"] as const;

const getAllUsers = async (query: GetUsersQuery) => {
  const limit = Math.max(1, Number(query.limit) || 10);
  const page = Math.max(1, Number(query.page) || 1);
  const skip = (page - 1) * limit;

  const SORTABLE_FIELDS = ["createdAt", "updatedAt"] as const;

  const sortBy =
    query.sortBy && SORTABLE_FIELDS.includes(query.sortBy)
      ? query.sortBy
      : "createdAt";

  const SORT_ORDERS = ["asc", "desc"] as const;

  const sortOrder =
    query.sortOrder && SORT_ORDERS.includes(query.sortOrder)
      ? query.sortOrder
      : "desc";

  const andCondition: UserWhereInput[] = [];

  const { isActive, role } = query;

  if (typeof isActive !== "undefined") {
    if (!["true", "false"].includes(isActive)) {
      throw new AppError(status.BAD_REQUEST, "isActive must be true or false");
    }
    andCondition.push({ isActive: isActive === "true" ? true : false });
  }

  if (role) {
    if (!isValidEnumValue(UserRole, role)) {
      throw new AppError(status.BAD_REQUEST, "Invalid Role");
    }
    andCondition.push({
      role,
    });
  }

  const users = await prisma.user.findMany({
    where: {
      AND: andCondition,
    },
    omit: {
      password: true,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: limit,
    skip,
  });

  const totalUsers = await prisma.user.count({
    where: {
      AND: andCondition,
    },
  });

  return {
    meta: {
      page,
      limit,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
    users,
  };
};

const updateUserStatus = async (userId: string, payload: UpdateUserStatus) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (user.isActive === payload.isActive) {
    throw new AppError(status.CONFLICT, "User is already updated");
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isActive: payload.isActive,
    },
    omit: {
      password: true,
    },
  });
};

const getAllRentalRequests = async (query: GetRentalRequestsQuery) => {
  const limit = Math.max(1, Number(query.limit) || 10);
  const page = Math.max(1, Number(query.page) || 1);
  const skip = (page - 1) * limit;

  const SORTABLE_FIELDS = [
    "createdAt",
    "requestedMoveInDate",
    "durationInMonths",
  ] as const;

  const sortBy =
    query.sortBy && SORTABLE_FIELDS.includes(query.sortBy)
      ? query.sortBy
      : "createdAt";

  const sortOrder =
    query.sortOrder && SORT_ORDERS.includes(query.sortOrder)
      ? query.sortOrder
      : "desc";

  const andCondition: RentalRequestWhereInput[] = [];

  if (query.status) {
    if (!isValidEnumValue(RentalRequestStatus, query.status)) {
      throw new AppError(status.BAD_REQUEST, "Invalid rental request status");
    }
    andCondition.push({
      status: query.status,
    });
  }

  const requests = await prisma.rentalRequest.findMany({
    where: {
      AND: andCondition,
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      property: {
        select: {
          id: true,
          title: true,
          location: true,
          rent: true,
        },
      },
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: limit,
    skip,
  });

  const totalRequests = await prisma.rentalRequest.count({
    where: {
      AND: andCondition,
    },
  });

  return {
    meta: {
      page,
      limit,
      total: totalRequests,
      totalPages: Math.ceil(totalRequests / limit),
    },
    requests,
  };
};

const getAllProperties = async (query: GetPropertyListingsQuery) => {
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
      AND: andCondition,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          tenantId: true,
        },
      },
      rentalRequests: {
        select: {
          id: true,
          status: true,
        },
      },
      rentalAgreements: {
        select: {
          id: true,
          status: true,
          payments: {
            select: {
              id: true,
              status: true,
            },
          },
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

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllRentalRequests,
  getAllProperties,
};
