import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(
    req.user.id,
    req.params.rentalAgreementId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Review submitted successfully",
    data: review,
  });
});

export const reviewController = {
  createReview,
};
