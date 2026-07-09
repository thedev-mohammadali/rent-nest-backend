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

export const adminController = {
  getAllUsers,
};
