import { prisma } from "../lib/prisma";
import catchAsync from "../utils/catchAsync";
import { verifyAccessToken } from "../utils/jwt";

const optionalAuthenticate = catchAsync(async (req, _res, next) => {
  const authorizationHeader = req.headers.authorization;

  const token = authorizationHeader
    ? authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.split(" ")[1]
      : authorizationHeader
    : req.cookies.accessToken;

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);

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

    if (authenticatedUser?.isActive) {
      req.user = authenticatedUser;
    }
  } catch {
    // If invalid token then continue as guest
  }

  next();
});

export default optionalAuthenticate;
