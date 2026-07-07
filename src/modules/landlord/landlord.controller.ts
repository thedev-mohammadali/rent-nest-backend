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

const editPropertyListing = catchAsync(async (req, res) => {
  const landlordId = req.user.id;
  const propertyId = req.params.id as string;

  const updatedListing = await landlordService.editPropertyListing(
    propertyId,
    landlordId,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Property updated successfully",
    data: updatedListing,
  });
});

export const landlordController = {
  createPropertyListing,
  editPropertyListing,
};
