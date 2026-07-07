import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { UserRole } from "../generated/prisma/enums";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";

const authorize = (...requiredRoles: [UserRole, ...UserRole[]]) =>
  catchAsync((req: Request, _res: Response, next: NextFunction) => {
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Please log in to continue",
        null,
      );
    }

    if (!requiredRoles.includes(authenticatedUser.role)) {
      throw new AppError(status.FORBIDDEN, "Access Forbidden!", [
        { message: "You are not authorized to access this resource." },
      ]);
    }

    next();
  });

export default authorize;
