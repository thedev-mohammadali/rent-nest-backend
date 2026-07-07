import status from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { authService } from "./auth.service";
import { accessCookieOptions, refreshCookieOptions } from "./cookie.utils";

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

  res.cookie("accessToken", accessToken, accessCookieOptions);

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Logged in successfully",
    data: { user, accessToken },
  });
});

const getMe = catchAsync(async (req, res) => {
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User data retrieved successfully",
    data: req.user,
  });
});

const logout = catchAsync(async (_req, res) => {
  res.clearCookie("accessToken", accessCookieOptions);

  res.clearCookie("refreshToken", refreshCookieOptions);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Logged out successfully",
  });
});

export const authController = {
  register,
  login,
  getMe,
  logout,
};
