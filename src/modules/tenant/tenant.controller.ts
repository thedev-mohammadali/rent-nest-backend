import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { tenantService } from "./tenant.service";

const submitRentalRequest = catchAsync(async (req, res) => {
  const rentalData = await tenantService.submitRentalRequest(
    req.user.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Rental request submitted successfully",
    data: rentalData,
  });
});

export const tenantController = {
  submitRentalRequest,
};
