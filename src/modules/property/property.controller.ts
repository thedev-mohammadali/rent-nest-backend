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

export const propertyController = {
  getAvailableProperties,
  getPropertyById,
};
