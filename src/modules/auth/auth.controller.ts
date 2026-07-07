import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authService } from "./auth.service";

const register = catchAsync(async (req, res) => {
  const registeredUserData = await authService.register(req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "User created successfully",
    data: registeredUserData,
  });
});

const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie("accessToken", accessToken);
  res.cookie("refreshToken", refreshToken);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Log in successfull",
    data: { user, accessToken },
  });
});

export const authController = {
  register,
  login,
};
