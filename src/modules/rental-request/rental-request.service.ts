import status from "http-status";
import { RentalRequestStatus } from "../../generated/prisma/enums";
import { RentalRequestWhereInput } from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { isValidEnumValue } from "../../utils/validateEnum";
import { GetRentalRequestsQuery } from "./rental-request.interface";
import {
  SubmitRentalRequestPayload,
  UpdateRentalRequestStatus,
} from "./rental-request.validation";

const SORT_ORDERS = ["asc", "desc"] as const;

const submitRentalRequest = async (
  tenantId: string,
  payload: SubmitRentalRequestPayload,
) => {
  const { propertyId, tenantMessage, requestedMoveInDate, durationInMonths } =
    payload;

  const availableProperty = await prisma.property.findFirst({
    where: {
      id: propertyId,
      isAvailable: true,
    },
  });

  if (!availableProperty) {
    throw new AppError(status.NOT_FOUND, "Property is not available");
  }

  const existingRequest = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId,
      status: {
        in: ["PENDING", "APPROVED"],
      },
    },
  });

  if (existingRequest) {
    throw new AppError(
      status.CONFLICT,
      "You already have an active rental request for this property",
    );
  }

  return prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId,
      tenantMessage,
      requestedMoveInDate,
      durationInMonths,
    },
    include: {
      property: true,
    },
  });
};

const getTenantRentalRequests = async (
  tenantId: string,
  query: GetRentalRequestsQuery,
) => {
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

  if (query.status && !isValidEnumValue(RentalRequestStatus, query.status)) {
    throw new AppError(status.BAD_REQUEST, "Invalid rental request status");
  }

  const requests = await prisma.rentalRequest.findMany({
    where: {
      tenantId,
      AND: andCondition,
    },
    include: {
      rentalAgreement: true,
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
      tenantId,
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

const getLandlordRentalRequests = async (
  landlordId: string,
  query: GetRentalRequestsQuery,
) => {
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
        },
      },
    },
  });

  if (!rentalRequest) {
    throw new AppError(status.NOT_FOUND, "Rental request not found");
  }

  if (rentalRequest.status !== RentalRequestStatus.PENDING) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only pending rental requests can be updated",
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
    const {
      id: rentalRequestId,
      tenantId,
      propertyId,
      durationInMonths,
      requestedMoveInDate,
      status,
      property,
    } = await tx.rentalRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: RentalRequestStatus.APPROVED,
      },
      include: {
        property: true,
      },
    });

    const leaseStartDate = new Date(requestedMoveInDate);
    const leaseEndDate = new Date(leaseStartDate);

    leaseEndDate.setMonth(leaseEndDate.getMonth() + durationInMonths);
    leaseEndDate.setDate(leaseEndDate.getDate() - 1);

    await tx.rentalAgreement.create({
      data: {
        rentalRequestId,
        tenantId,
        propertyId,
        monthlyRent: property.rent,
        durationInMonths,
        leaseStartDate,
        leaseEndDate,
      },
    });

    await tx.rentalRequest.updateMany({
      where: {
        propertyId,
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
        id: propertyId,
      },
      data: {
        isAvailable: false,
      },
    });

    return status;
  });

  return updatedStatus;
};

export const rentalRequestService = {
  getLandlordRentalRequests,
  updateRentalRequestStatus,
  submitRentalRequest,
  getTenantRentalRequests,
};
