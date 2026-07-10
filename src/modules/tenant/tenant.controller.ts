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

const getTenantRentalRequests = catchAsync(async (req, res) => {
  const { meta, requests } = await tenantService.getTenantRentalRequests(
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

const updateRentalAgreementStatus = catchAsync(async (req, res) => {
  const updatedData = await tenantService.updateRentalAgreementStatus(
    req.user.id,
    req.params.agreementId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `Rental agreement status updated to ${updatedData.status} successfully`,
  });
});

export const tenantController = {
  submitRentalRequest,
  getTenantRentalRequests,
  updateRentalAgreementStatus,
};
