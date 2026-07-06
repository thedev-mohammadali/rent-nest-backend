import { Request, Response } from "express";
import status from "http-status";
import { authService } from "./auth.service";

const register = async (req: Request, res: Response) => {
  try {
    const registeredUserData = await authService.register(req.body);

    res.status(status.CREATED).json({
      success: true,
      message: "User created successfully",
      data: registeredUserData,
    });
  } catch (error: any) {
    res.status(status.INTERNAL_SERVER_ERROR).json({
      success: true,
      message: error.message,
      error: error,
    });
  }
};

export const authController = {
  register,
};
