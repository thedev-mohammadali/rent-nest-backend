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

const getAllRentalRequests = catchAsync(async (req, res) => {
  const { meta, requests } = await tenantService.getAllRentalRequests(
    req.user.id,
    req.query,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Rental requests retreived successfully",
    meta,
    data: requests,
  });
});

export const tenantController = {
  submitRentalRequest,
  getAllRentalRequests,
};
