import status from "http-status";
import env from "../../config/env";
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

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv !== "development",
    maxAge: env.jwtAccessExpiresMs,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv !== "development",
    maxAge: env.jwtRefreshExpiresMs,
  });

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

export const authController = {
  register,
  login,
  getMe,
};
