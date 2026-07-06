import bcrypt from "bcrypt";
import status from "http-status";
import env from "../../config/env";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { RegisterPayload } from "./auth.validation";

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

export const authService = {
  register,
};
