import status from "http-status";
import { UserRole } from "../../generated/prisma/enums";
import { AuthenticatedUser } from "../../types/auth";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Scope } from "./payment.query";
import { paymentService } from "./payment.service";

const getPayments = catchAsync(async (req, res) => {
  const scope = getPaymentScope(req.user);
  const { meta, payments, summary } = await paymentService.listPayments(
    req.query,
    scope,
  );

  const paymentSummary = {
    pending: {
      amount: "0",
      count: 0,
    },
    paid: {
      amount: "0",
      count: 0,
    },
  };

  for (const item of summary) {
    if (item.status === "PENDING") {
      paymentSummary.pending = {
        amount: item._sum.amount?.toString() ?? "0",
        count: item._count._all,
      };
    }

    if (item.status === "PAID") {
      paymentSummary.paid = {
        amount: item._sum.amount?.toString() ?? "0",
        count: item._count._all,
      };
    }
  }

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payments retrieved successfully",
    meta,
    data: {
      payments,
      summary: paymentSummary,
    },
  });
});

const getPaymentById = catchAsync(async (req, res) => {
  const scope = getPaymentScope(req.user);

  const payment = await paymentService.getPaymentById(
    req.params.paymentId as string,
    scope,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment retrieved successfully",
    data: payment,
  });
});

const handleStripeWebhook = catchAsync(async (req, res) => {
  await paymentService.handleStripeWebhook(
    req.body,
    req.headers["stripe-signature"] as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Webhook received",
  });
});

const createCheckoutSession = catchAsync(async (req, res) => {
  const checkoutSession = await paymentService.createCheckoutSession(
    req.user.id,
    req.user.email,
    req.params.agreementId as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Checkout session created successfully",
    data: checkoutSession,
  });
});

const verifyCheckoutSession = catchAsync(async (req, res) => {
  const tenantId = req.user.id;

  const payment = await paymentService.verifyCheckoutSession(
    req.params.sessionId as string,
    tenantId,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment session verified successfully",
    data: payment,
  });
});

const successPayment = catchAsync(async (req, res) => {
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment Successful",
  });
});

function getPaymentScope(user: AuthenticatedUser): Scope {
  switch (user.role) {
    case UserRole.TENANT:
      return {
        type: "TENANT",
        tenantId: user.id,
      };

    case UserRole.LANDLORD:
      return {
        type: "LANDLORD",
        landlordId: user.id,
      };

    case UserRole.ADMIN:
      return {
        type: "ADMIN",
      };
  }
}

export const paymentController = {
  createCheckoutSession,
  handleStripeWebhook,
  getPayments,
  getPaymentById,
  successPayment,
  verifyCheckoutSession,
};
