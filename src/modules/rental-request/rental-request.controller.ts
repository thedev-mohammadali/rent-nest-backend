import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { rentalRequestService } from "./rental-request.service";

const getRentalRequests = catchAsync(async (req, res) => {
  const landlordId = req.user.id;

  const { meta, requests } = await rentalRequestService.getRentalRequests(
    landlordId,
    req.query,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Rental requests retrieved successfully",
    meta,
    data: requests,
  });
});

const updateRentalRequestStatus = catchAsync(async (req, res) => {
  const landlordId = req.user.id;

  const updatedStatus = await rentalRequestService.updateRentalRequestStatus(
    landlordId,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `Rental requests status updated to ${updatedStatus} successfully`,
  });
});

export const rentalRequestController = {
  getRentalRequests,
  updateRentalRequestStatus,
};
