import status from "http-status";
import Stripe from "stripe";
import { getPagination } from "../../common/query/pagination";
import env from "../../config/env";
import { Prisma } from "../../generated/prisma/client";
import {
  PaymentStatus,
  RentalAgreementStatus,
} from "../../generated/prisma/enums";
import { PaymentWhereInput } from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe/stripe";
import { stripeService } from "../../lib/stripe/stripe.service";
import AppError from "../../utils/AppError";
import { GetPaymentsQuery } from "./payment.interface";
import {
  buildPaymentFilter,
  buildPaymentSorting,
  Scope,
} from "./payment.query";

const listPayments = async (query: GetPaymentsQuery, scope: Scope) => {
  const dataLimit = Number(query.limit);
  const currentPage = Number(query.page);

  const { limit, page, skip } = getPagination(currentPage, dataLimit);

  const andCondition = buildPaymentFilter(query, scope);
  const { sortBy, sortOrder } = buildPaymentSorting(query);

  const payments = await prisma.payment.findMany({
    where: {
      AND: andCondition,
    },
    omit: {
      checkoutUrl: true,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    take: limit,
    skip,
  });

  const paymentSummary = await prisma.payment.groupBy({
    by: ["status"],
    where: {
      AND: andCondition,
    },
    _sum: {
      amount: true,
    },
    _count: {
      _all: true,
    },
  });

  const totalPayments = await prisma.payment.count({
    where: {
      AND: andCondition,
    },
  });

  return {
    meta: {
      page,
      limit,
      total: totalPayments,
      totalPages: Math.ceil(totalPayments / limit),
    },
    payments,
    summary: paymentSummary,
  };
};

const getPaymentById = async (paymentId: string, scope: Scope) => {
  const andCondition: PaymentWhereInput[] = [];

  switch (scope.type) {
    case "TENANT":
      andCondition.push({
        rentalAgreement: {
          tenantId: scope.tenantId,
        },
      });
      break;

    case "LANDLORD":
      andCondition.push({
        rentalAgreement: {
          property: {
            landlordId: scope.landlordId,
          },
        },
      });
      break;
  }

  const payment = prisma.payment.findFirst({
    where: {
      id: paymentId,
      AND: andCondition,
    },
    omit: {
      checkoutUrl: true,
    },
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found");
  }

  return payment;
};

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
  userEmail: string,
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
    throw new AppError(status.NOT_FOUND, "Rental agreement not found");
  }

  if (rentalAgreement.status !== RentalAgreementStatus.PENDING_PAYMENT) {
    throw new AppError(
      status.BAD_REQUEST,
      "Payment is not available for this agreement",
    );
  }

  const payment = await prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findFirst({
      where: {
        rentalAgreementId,
        status: {
          in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING],
        },
        checkoutUrl: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingPayment?.sessionExpiresAt && existingPayment.checkoutUrl) {
      const isExpired =
        new Date() >= new Date(existingPayment.sessionExpiresAt);
      if (!isExpired) {
        return existingPayment;
      }
    }

    return tx.payment.create({
      data: {
        rentalAgreementId,
        amount: rentalAgreement.monthlyRent,
        currency: "bdt",
      },
    });
  });

  if (payment.sessionExpiresAt) {
    const isExpired = new Date() >= new Date(payment.sessionExpiresAt);
    if (!isExpired) {
      return {
        checkoutUrl: payment.checkoutUrl,
      };
    }
  }

  const paymentMetadata = {
    paymentId: payment.id,
    rentalAgreementId,
    rentalRequestId: rentalAgreement.rentalRequestId,
    tenantId,
    email: userEmail,
    currency: payment.currency,
    amount: Math.round(Number(payment.amount)),
    propertyTitle: rentalAgreement.property.title,
  };

  const checkoutSession =
    await stripeService.createCheckoutSession(paymentMetadata);

  await prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      stripeSessionId: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
      metadata: paymentMetadata,
      sessionExpiresAt: new Date(
        checkoutSession.expires_at * 1000,
      ).toISOString(),
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
    );
  }

  const payment = await tx.payment.findUnique({
    where: {
      id: paymentId,
    },
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Pyament not found");
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

const verifyCheckoutSession = async (sessionId: string, tenantId: string) => {
  const session = await stripeService.getCheckoutSession(sessionId);

  if (!session) {
    throw new AppError(status.NOT_FOUND, "Payment session not found");
  }

  const paymentId = session.metadata?.paymentId;

  if (!paymentId) {
    throw new AppError(status.BAD_REQUEST, "Invalid payment session");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      rentalAgreement: {
        tenantId,
      },
    },
    include: {
      rentalAgreement: {
        include: {
          property: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found");
  }

  if (session.metadata?.tenantId !== tenantId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to view this payment",
    );
  }

  return {
    id: payment.id,
    amount: payment.amount.toString(),
    currency: payment.currency,
    status: payment.status,
    provider: payment.provider,
    propertyTitle: payment.rentalAgreement.property.title,
    rentalAgreementId: payment.rentalAgreementId,
    stripeSessionId: session.id,
    paymentStatus: session.payment_status,
  };
};

export const paymentService = {
  createCheckoutSession,
  handleStripeWebhook,
  listPayments,
  getPaymentById,
  verifyCheckoutSession,
};
