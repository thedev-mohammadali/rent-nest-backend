import { status } from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
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
    message: `User is now ${user.isActive ? "Unbanned" : "Banned"}`,
    data: user,
  });
});

export const adminController = {
  getAllUsers,
  updateUserStatus,
};
