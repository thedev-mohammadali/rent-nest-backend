import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { rentalAgreementService } from "./rental-agreement.service";

const getLandlordRentalAgreements = catchAsync(async (req, res) => {
  const landlordId = req.user.id;

  const { meta, agreements } =
    await rentalAgreementService.getLandlordRentalAgreements(
      landlordId,
      req.query,
    );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `Rental agreements retreived successfully`,
    meta,
    data: agreements,
  });
});

const updateRentalAgreementStatus = catchAsync(async (req, res) => {
  const updatedData = await rentalAgreementService.updateRentalAgreementStatus(
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

export const rentalAgreementcontroller = {
  getLandlordRentalAgreements,
  updateRentalAgreementStatus,
};
