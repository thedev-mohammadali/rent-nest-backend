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

export const rentalAgreementcontroller = {
  getLandlordRentalAgreements,
};
