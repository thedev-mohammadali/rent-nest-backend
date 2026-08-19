import status from "http-status";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import { verifyAccessToken } from "../utils/jwt";

const authenticate = catchAsync(async (req, _res, next) => {
  console.log("AUTH HEADERS:", req.headers);
  console.log("AUTH COOKIES:", req.cookies);

  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader
    ? authorizationHeader.startsWith("Bearer")
      ? authorizationHeader.split(" ")[1]
      : authorizationHeader
    : req.cookies.accessToken;

  console.log("AUTH TOKEN:", token);

  if (!token) {
    throw new AppError(status.UNAUTHORIZED, "Please log in to continue");
  }

  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new AppError(status.UNAUTHORIZED, "Invalid or expired token");
  }

  console.log("DECODED:", decoded);

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
    );
  }

  if (!authenticatedUser.isActive) {
    throw new AppError(
      status.FORBIDDEN,
      "Account is not active. Please contact support.",
    );
  }

  req.user = authenticatedUser;

  next();
});

export default authenticate;
