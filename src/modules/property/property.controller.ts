import { status } from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Scope } from "./property.query";
import { propertyService } from "./property.service";

const getMyProperties = catchAsync(async (req, res) => {
  const { meta, listings } = await propertyService.listProperties(req.query, {
    type: "LANDLORD",
    landlordId: req.user.id,
  });

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Properties retreived successfully",
    meta,
    data: listings,
  });
});

const getProperties = catchAsync(async (req, res) => {
  const scope: Scope =
    req.user?.role === "ADMIN" ? { type: "ADMIN" } : { type: "PUBLIC" };

  const { meta, listings } = await propertyService.listProperties(
    req.query,
    scope,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Properties retreived successfully",
    meta,
    data: listings,
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
  getProperties,
  getMyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyPropertyById,
  updatePropertyAvailability,
};
