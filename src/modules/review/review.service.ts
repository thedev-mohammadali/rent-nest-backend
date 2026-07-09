import status from "http-status";
import { RentalAgreementStatus } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { CreateReview } from "./review.validate";

const createReview = async (
  tenantId: string,
  rentalAgreementId: string,
  payload: CreateReview,
) => {
  const validRentalAgreement = await prisma.rentalAgreement.findFirst({
    where: {
      id: rentalAgreementId,
      tenantId: tenantId,
      status: {
        in: [RentalAgreementStatus.COMPLETED, RentalAgreementStatus.TERMINATED],
      },
    },
  });

  if (!validRentalAgreement) {
    throw new AppError(
      status.NOT_FOUND,
      "No reviewable rental agreement was found",
      null,
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      rentalAgreementId,
    },
  });

  if (existingReview) {
    throw new AppError(
      status.CONFLICT,
      "Review already submitted for this agreement",
      null,
    );
  }

  return prisma.review.create({
    data: {
      ...payload,
      tenantId,
      rentalAgreementId,
      propertyId: validRentalAgreement.propertyId,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      user: {
        select: {
          name: true,
        },
      },
      property: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

export const reviewService = {
  createReview,
};
