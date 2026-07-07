import bcrypt from "bcrypt";
import status from "http-status";
import env from "../../config/env";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { LoginPayload, RegisterPayload } from "./auth.validation";

const register = async (payload: RegisterPayload) => {
  const { name, email, password, role } = payload;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError(
      status.CONFLICT,
      "User already exists with this email",
      null,
    );
  }

  const hashedPassword = await bcrypt.hash(password, env.saltRounds);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    omit: {
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const login = async (payload: LoginPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Invalid credentials", [
      { message: "Email or Password didn't match" },
    ]);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError(status.UNAUTHORIZED, "Invalid credentials", [
      { message: "Email or Password didn't match" },
    ]);
  }

  if (!user.isActive) {
    throw new AppError(
      status.FORBIDDEN,
      "Account is not active. Please contact support.",
      null,
    );
  }

  const tokenPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);

  const refreshToken = generateRefreshToken(tokenPayload);

  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (payload: string) => {
  const verifiedRefreshToken = verifyRefreshToken(payload);

  const user = await prisma.user.findUnique({
    where: {
      id: verifiedRefreshToken.userId,
    },
    select: {
      id: true,
      isActive: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Authentication required. Please login to continue",
      null,
    );
  }

  if (!user.isActive) {
    throw new AppError(
      status.UNAUTHORIZED,
      "Account is inactive. Please contact support",
      null,
    );
  }

  const tokenPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);

  return accessToken;
};

export const authService = {
  register,
  login,
  refreshAccessToken,
};
