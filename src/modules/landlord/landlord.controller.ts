import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { landlordService } from "./landlord.service";

const getMyProperties = catchAsync(async (req, res) => {
  const landlordId = req.user.id;

  const { meta, listings } = await landlordService.getMyProperties(
    landlordId,
    req.query,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Property listings retrieved successfully",
    meta,
    data: listings,
  });
});

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

const deletePropertyListing = catchAsync(async (req, res) => {
  const landlordId = req.user.id;
  const propertyId = req.params.id as string;

  await landlordService.deletePropertyListing(propertyId, landlordId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Property deleted successfully",
  });
});

const getMyPropertyById = catchAsync(async (req, res) => {
  const landlordId = req.user.id;
  const propertyId = req.params.id as string;

  const property = await landlordService.getMyPropertyById(
    propertyId,
    landlordId,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Property retrieved successfully",
    data: property,
  });
});

const updateMyPropertyAvailabilityStatus = catchAsync(async (req, res) => {
  const landlordId = req.user.id;
  const propertyId = req.params.id as string;

  const propertyStatus =
    await landlordService.updateMyPropertyAvailabilityStatus(
      propertyId,
      landlordId,
    );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `Property status updated to ${propertyStatus.isAvailable} successfully`,
  });
});

export const landlordController = {
  createPropertyListing,
  editPropertyListing,
  getMyProperties,
  deletePropertyListing,
  getMyPropertyById,
  updateMyPropertyAvailabilityStatus,
};
