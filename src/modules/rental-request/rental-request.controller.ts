import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { rentalRequestService } from "./rental-request.service";

const submitRentalRequest = catchAsync(async (req, res) => {
  const rentalData = await rentalRequestService.submitRentalRequest(
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

const getTenantRentalRequests = catchAsync(async (req, res) => {
  const tenantId = req.user.id;

  const { meta, requests } = await rentalRequestService.listRentalRequests(
    req.query,
    { type: "TENANT", tenantId },
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Rental requests retreived successfully",
    meta,
    data: requests,
  });
});

const getLandlordRentalRequests = catchAsync(async (req, res) => {
  const landlordId = req.user.id;

  const { meta, requests } = await rentalRequestService.listRentalRequests(
    req.query,
    { type: "LANDLORD", landlordId },
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
  getLandlordRentalRequests,
  updateRentalRequestStatus,
  submitRentalRequest,
  getTenantRentalRequests,
};
