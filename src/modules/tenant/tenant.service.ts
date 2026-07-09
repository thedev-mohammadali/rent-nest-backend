import status from "http-status";
import { RentalRequestStatus } from "../../generated/prisma/enums";
import { RentalRequestWhereInput } from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { isValidEnumValue } from "../../utils/validateEnum";
import { GetRentalRequestsQuery } from "../landlord/landlord.interface";
import { SubmitRentalRequestPayload } from "./tenant.validate";

const SORT_ORDERS = ["asc", "desc"] as const;

const submitRentalRequest = async (
  tenantId: string,
  payload: SubmitRentalRequestPayload,
) => {
  const { propertyId, message, requestedMoveInDate, durationInMonths } =
    payload;

  const availableProperty = await prisma.property.findFirst({
    where: {
      id: propertyId,
      isAvailable: true,
    },
  });

  if (!availableProperty) {
    throw new AppError(status.NOT_FOUND, "Property is not available", null);
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
      null,
    );
  }

  return prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId,
      message,
      requestedMoveInDate,
      durationInMonths,
    },
    include: {
      property: true,
    },
  });
};

const getAllRentalRequests = async (
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
    throw new AppError(
      status.BAD_REQUEST,
      "Invalid rental request status",
      null,
    );
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

export const tenantService = {
  submitRentalRequest,
  getAllRentalRequests,
};
