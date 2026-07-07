import { NextFunction, Request, Response } from "express";
import status from "http-status";
import jwt from "jsonwebtoken";
import env from "../config/env";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";
import { JwtTokenPayload } from "../utils/jwt";

const authenticate = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader
      ? authorizationHeader.startsWith("Bearer")
        ? authorizationHeader.split(" ")[1]
        : authorizationHeader
      : req.cookies.accessToken;

    if (!token) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Please log in to continue",
        null,
      );
    }

    const decoded = jwt.verify(token, env.jwtAccessSecret) as JwtTokenPayload;

    const authenticatedUser = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        role: true,
      },
    });

    if (!authenticatedUser) {
      throw new AppError(
        status.UNAUTHORIZED,
        "Authentication failed! Please log in again to continue",
        null,
      );
    }

    if (!authenticatedUser.isActive) {
      throw new AppError(
        status.FORBIDDEN,
        "Account is not active. Please contact support.",
        null,
      );
    }

    req.user = authenticatedUser;

    console.log(authenticatedUser);

    next();
  };
};

export default authenticate;
