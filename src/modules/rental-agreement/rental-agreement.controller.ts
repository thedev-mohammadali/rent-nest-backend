import status from "http-status";
import { UserRole } from "../../generated/prisma/enums";
import { AuthenticatedUser } from "../../types/auth";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Scope } from "./rental-agreement.query";
import { rentalAgreementService } from "./rental-agreement.service";

const getRentalAgreements = catchAsync(async (req, res) => {
  const scope = getRentalAgreementScope(req.user);

  const { meta, agreements } =
    await rentalAgreementService.listRentalAgreements(req.query, scope);

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

function getRentalAgreementScope(user: AuthenticatedUser): Scope {
  switch (user.role) {
    case UserRole.TENANT:
      return {
        type: "TENANT",
        tenantId: user.id,
      };

    case UserRole.LANDLORD:
      return {
        type: "LANDLORD",
        landlordId: user.id,
      };

    case UserRole.ADMIN:
      return {
        type: "ADMIN",
      };
  }
}

export const rentalAgreementcontroller = {
  getRentalAgreements,
  updateRentalAgreementStatus,
};
