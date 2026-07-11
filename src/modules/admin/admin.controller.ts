import { status } from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentService } from "../payment/payment.service";
import { propertyService } from "../property/property.service";
import { rentalAgreementService } from "../rental-agreement/rental-agreement.service";
import { rentalRequestService } from "../rental-request/rental-request.service";
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
  const { meta, requests } = await rentalRequestService.listRentalRequests(
    req.query,
    { type: "ADMIN" },
  );

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

const getAllRentalAgreements = catchAsync(async (req, res) => {
  const { meta, agreements } =
    await rentalAgreementService.listRentalAgreements(req.query, {
      type: "ADMIN",
    });

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Rental agreements retrieved successfully",
    meta,
    data: agreements,
  });
});

const getAllPayments = catchAsync(async (req, res) => {
  const { meta, payments } = await paymentService.listPayments(req.query, {
    type: "ADMIN",
  });

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payments retreived successfully",
    meta,
    data: payments,
  });
});

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  getAllRentalRequests,
  getAllRentalAgreements,
  getAllPayments,
};
