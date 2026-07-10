import status from "http-status";
import { RentalAgreementStatus } from "../../generated/prisma/enums";
import { RentalAgreementWhereInput } from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { isValidEnumValue } from "../../utils/validateEnum";
import { GetRentalAgreementsQuery } from "./rental-agreement.interface";

const SORT_ORDERS = ["asc", "desc"] as const;

const getLandlordRentalAgreements = async (
  landlordId: string,
  query: GetRentalAgreementsQuery,
) => {
  const limit = Math.max(1, Number(query.limit) || 10);
  const page = Math.max(1, Number(query.page) || 1);
  const skip = (page - 1) * limit;

  const SORTABLE_FIELDS = [
    "createdAt",
    "leaseStartDate",
    "leaseEndDate",
  ] as const;

  const sortBy =
    query.sortBy && SORTABLE_FIELDS.includes(query.sortBy)
      ? query.sortBy
      : "createdAt";

  const sortOrder =
    query.sortOrder && SORT_ORDERS.includes(query.sortOrder)
      ? query.sortOrder
      : "desc";

  const andCondition: RentalAgreementWhereInput[] = [];

  if (query.status) {
    if (!isValidEnumValue(RentalAgreementStatus, query.status)) {
      throw new AppError(status.BAD_REQUEST, "Invalid status query");
    }
    andCondition.push({
      status: query.status,
    });
  }

  const agreements = await prisma.rentalAgreement.findMany({
    where: {
      property: {
        landlordId,
      },
      AND: andCondition,
    },
    select: {
      id: true,
      tenant: {
        select: {
          id: true,
          name: true,
        },
      },
      property: {
        select: {
          id: true,
          title: true,
        },
      },
      status: true,
      activatedAt: true,
      leaseStartDate: true,
      leaseEndDate: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: limit,
    skip,
  });

  const totalAgreements = await prisma.rentalAgreement.count({
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
      total: totalAgreements,
      totalPages: Math.ceil(totalAgreements / limit),
    },
    agreements,
  };
};

export const rentalAgreementService = {
  getLandlordRentalAgreements,
};
