import status from "http-status";
import {
  RentalRequestStatus,
  RentalStatus,
} from "../../generated/prisma/enums";
import {
  PropertyWhereInput,
  RentalRequestWhereInput,
} from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { isValidEnumValue } from "../../utils/validateEnum";
import {
  GetPropertyListingsQuery,
  GetRentalRequestsQuery,
} from "./landlord.interface";
import {
  CreatePropertyListingPayload,
  UpdatePropertyListingPayload,
  UpdateRentalRequestStatus,
} from "./landlord.validate";

const SORT_ORDERS = ["asc", "desc"] as const;

const getMyProperties = async (
  landlordId: string,
  query: GetPropertyListingsQuery,
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

const deletePropertyListing = async (
  propertyId: string,
  landlordId: string,
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
    throw new AppError(status.NOT_FOUND, "Property not found", null);
  }

  return property;
};

const updateMyPropertyAvailabilityStatus = async (
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
    throw new AppError(status.NOT_FOUND, "Property not found", null);
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

const getRentalRequests = async (
  landlordId: string,
  query: GetRentalRequestsQuery,
) => {
  const limit = Math.max(1, Number(query.limit) || 10);
  const page = Math.max(1, Number(query.page) || 1);
  const skip = (page - 1) * limit;

  const SORTABLE_FIELDS = [
    "createdAt",
    "leaseStartDate",
    "leaseEndDate",
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

  const { rentalStatus, status: rentalRequestStatus } = query;

  const andCondition: RentalRequestWhereInput[] = [];

  if (rentalStatus) {
    if (!isValidEnumValue(RentalStatus, rentalStatus)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid rental request status",
        null,
      );
    }
    andCondition.push({
      rentalStatus,
    });
  }

  if (rentalRequestStatus) {
    if (!isValidEnumValue(RentalRequestStatus, rentalRequestStatus)) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid rental request status",
        null,
      );
    }
    andCondition.push({
      status: rentalRequestStatus,
    });
  }

  const requests = await prisma.rentalRequest.findMany({
    where: {
      property: {
        landlordId,
      },
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
      property: {
        landlordId,
      },
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

const updateRentalRequestStatus = async (
  landlordId: string,
  requestId: string,
  payload: UpdateRentalRequestStatus,
) => {
  const rentalRequest = await prisma.rentalRequest.findFirst({
    where: {
      id: requestId,
      property: {
        landlordId,
      },
    },
    include: {
      property: {
        select: {
          id: true,
          rent: true,
        },
      },
    },
  });

  if (!rentalRequest) {
    throw new AppError(status.NOT_FOUND, "Rental request not found", null);
  }

  if (rentalRequest.status !== RentalRequestStatus.PENDING) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only pending rental requests can be updated",
      null,
    );
  }

  if (payload.status === RentalRequestStatus.REJECTED) {
    const updatedRequest = await prisma.rentalRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: RentalRequestStatus.REJECTED,
      },
      select: {
        status: true,
      },
    });

    return updatedRequest.status;
  }

  const updatedStatus = await prisma.$transaction(async (tx) => {
    const leaseStartDate = rentalRequest.requestedMoveInDate;

    const leaseEndDate = new Date(leaseStartDate);

    leaseEndDate.setMonth(
      leaseEndDate.getMonth() + rentalRequest.durationInMonths,
    );

    const updatedRequest = await tx.rentalRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: RentalRequestStatus.APPROVED,
        monthlyRent: rentalRequest.property.rent,
        leaseStartDate,
        leaseEndDate,
      },
      select: {
        status: true,
        propertyId: true,
      },
    });

    await tx.rentalRequest.updateMany({
      where: {
        propertyId: updatedRequest.propertyId,

        status: RentalRequestStatus.PENDING,

        id: {
          not: requestId,
        },
      },
      data: {
        status: RentalRequestStatus.REJECTED,
      },
    });

    await tx.property.update({
      where: {
        id: updatedRequest.propertyId,
      },
      data: {
        isAvailable: false,
      },
    });

    return updatedRequest.status;
  });

  return updatedStatus;
};

export const landlordService = {
  createPropertyListing,
  editPropertyListing,
  getMyProperties,
  deletePropertyListing,
  getMyPropertyById,
  updateMyPropertyAvailabilityStatus,
  getRentalRequests,
  updateRentalRequestStatus,
};
