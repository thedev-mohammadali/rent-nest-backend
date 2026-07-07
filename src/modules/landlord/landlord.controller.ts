import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { landlordService } from "./landlord.service";

const createPropertyListing = catchAsync(async (req, res) => {
  const landlordId = req.user.id;

  const listing = await landlordService.createPropertyListing(
    landlordId,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Property listing created successfully",
    data: listing,
  });
});

export const landlordController = {
  createPropertyListing,
};
