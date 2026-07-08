import status from "http-status";
import {
  PaymentStatus,
  RentalAgreementStatus,
} from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";

const createCheckoutSession = async (
  tenantId: string,
  rentalAgreementId: string,
) => {
  const rentalAgreement = await prisma.rentalAgreement.findFirst({
    where: {
      id: rentalAgreementId,
      tenantId,
    },
    include: {
      property: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!rentalAgreement) {
    throw new AppError(status.NOT_FOUND, "Rental agreement not found", null);
  }

  if (rentalAgreement.status !== RentalAgreementStatus.PENDING_PAYMENT) {
    throw new AppError(
      status.BAD_REQUEST,
      "Payment is not available for this agreement",
      null,
    );
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      rentalAgreementId,
      status: {
        in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING],
      },
    },
  });

  if (existingPayment) {
    throw new AppError(
      status.CONFLICT,
      "A payment is already pending for this agreement",
      null,
    );
  }

  const payment = await prisma.payment.create({
    data: {
      rentalAgreementId,
      amount: rentalAgreement.monthlyRent,
    },
  });
};

export const paymentService = {
  createCheckoutSession,
};
