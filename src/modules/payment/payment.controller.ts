import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

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

export const paymentController = {
  createCheckoutSession,
  handleStripeWebhook,
};
