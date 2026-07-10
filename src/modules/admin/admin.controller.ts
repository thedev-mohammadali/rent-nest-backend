import { status } from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { propertyService } from "../property/property.service";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(async (req, res) => {
  const { meta, users } = await adminService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Users retreived successfully",
    meta,
    data: users,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const user = await adminService.updateUserStatus(
    req.params.userId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `User ${user.isActive ? "unbanned" : "banned"} successfully`,
    data: user,
  });
});

const getAllRentalRequests = catchAsync(async (req, res) => {
  const { meta, requests } = await adminService.getAllRentalRequests(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Rental reqeusts retrieved successfully",
    meta,
    data: requests,
  });
});

const getAllProperties = catchAsync(async (req, res) => {
  const { meta, listings } = await propertyService.listProperties(req.query, {
    type: "ADMIN",
  });

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Property listings retrieved successfully",
    meta,
    data: listings,
  });
});

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  getAllRentalRequests,
};
