import status from "http-status";
import Stripe from "stripe";
import env from "../../config/env";
import { Prisma } from "../../generated/prisma/client";
import {
  PaymentStatus,
  RentalAgreementStatus,
} from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe/stripe";
import { stripeService } from "../../lib/stripe/stripe.service";
import AppError from "../../utils/AppError";

const handleStripeWebhook = async (payload: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.endpointSecret,
    );
  } catch (error) {
    throw new AppError(
      status.BAD_REQUEST,
      "⚠️ Webhook signature verification failed.",
      null,
    );
  }

  const existingEvent = await prisma.stripeWebhookEvent.findUnique({
    where: {
      stripeEventId: event.id,
    },
  });

  if (existingEvent?.processedAt) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const webhookEvent = await prisma.stripeWebhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
      },
    });

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(tx, event.data.object);
        break;
      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    await tx.stripeWebhookEvent.update({
      where: {
        id: webhookEvent.id,
      },
      data: {
        processedAt: new Date(),
      },
    });
  });
};

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
    amount: Math.round(Number(payment.amount)),
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

const handleCheckoutCompleted = async (
  tx: Prisma.TransactionClient,
  session: Stripe.Checkout.Session,
) => {
  const paymentId = session.metadata?.paymentId;

  if (!paymentId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Pyament ID missing from Stripe metadata",
      null,
    );
  }

  const payment = await tx.payment.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Pyament not found", null);
  }

  if (payment.status === "PAID") {
    return;
  }

  const paidAt = new Date();

  await tx.payment.update({
    where: {
      id: paymentId,
    },
    data: {
      status: "PAID",
      paidAt,
      stripePaymentIntentId: session.payment_intent as string,
    },
  });

  await tx.rentalAgreement.update({
    where: {
      id: payment.rentalAgreementId,
    },
    data: {
      status: "ACTIVE",
      activatedAt: paidAt,
    },
  });
};

export const paymentService = {
  createCheckoutSession,
  handleStripeWebhook,
};
