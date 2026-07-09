import status from "http-status";
import {
  PaymentStatus,
  RentalAgreementStatus,
} from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { stripeService } from "../../lib/stripe/stripe.service";
import AppError from "../../utils/AppError";

const handleStripeWebhook = async (payload: Buffer, signature: string) => {};

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

  const payment = await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findFirst({
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
    return tx.payment.create({
      data: {
        rentalAgreementId,
        amount: rentalAgreement.monthlyRent,
        currency: "bdt",
      },
    });
  });

  const checkoutSession = await stripeService.createCheckoutSession({
    paymentId: payment.id,
    rentalAgreementId,
    rentalRequestId: rentalAgreement.rentalRequestId,
    tenantId,
    currency: payment.currency,
    amount: Number(payment.amount),
    propertyTitle: rentalAgreement.property.title,
  });

  await prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      stripeSessionId: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
    },
  });

  return {
    checkoutUrl: checkoutSession.url,
  };
};

export const paymentService = {
  createCheckoutSession,
  handleStripeWebhook,
};
