import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createCheckoutSession = catchAsync(async (req, res) => {
  const data = await paymentService.createCheckoutSession(
    req.user.id,
    req.params.agreementId as string,
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Checkout session created successfully",
    data: data,
  });
});

export const paymentController = {
  createCheckoutSession,
};
