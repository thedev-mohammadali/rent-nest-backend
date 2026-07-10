import { status } from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { propertyService } from "./property.service";

const getAvailableProperties = catchAsync(async (req, res) => {
  const { meta, properties } = await propertyService.getAvailableProperties(
    req.query,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Properties retreived successfully",
    meta,
    data: properties,
  });
});

const getPropertyById = catchAsync(async (req, res) => {
  const property = await propertyService.getPropertyById(
    req.params.propertyId as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Property retreived successfully",
    data: property,
  });
});

const getMyProperties = catchAsync(async (req, res) => {
  const landlordId = req.user.id;

  const { meta, listings } = await propertyService.getMyProperties(
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

const createProperty = catchAsync(async (req, res) => {
  const landlordId = req.user.id;

  const listing = await propertyService.createProperty(landlordId, req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Property listing created successfully",
    data: listing,
  });
});

const updateProperty = catchAsync(async (req, res) => {
  const landlordId = req.user.id;
  const propertyId = req.params.propertyId as string;

  const updatedListing = await propertyService.updateProperty(
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

const deleteProperty = catchAsync(async (req, res) => {
  const landlordId = req.user.id;
  const propertyId = req.params.propertyId as string;

  await propertyService.deleteProperty(propertyId, landlordId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Property deleted successfully",
  });
});

const getMyPropertyById = catchAsync(async (req, res) => {
  const landlordId = req.user.id;
  const propertyId = req.params.propertyId as string;

  const property = await propertyService.getMyPropertyById(
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

const updatePropertyAvailability = catchAsync(async (req, res) => {
  const landlordId = req.user.id;
  const propertyId = req.params.propertyId as string;

  const propertyStatus = await propertyService.updatePropertyAvailability(
    propertyId,
    landlordId,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `Property status updated to ${propertyStatus.isAvailable} successfully`,
  });
});

export const propertyController = {
  getAvailableProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyPropertyById,
  updatePropertyAvailability,
};
