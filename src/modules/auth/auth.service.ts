import bcrypt from "bcrypt";
import env from "../../config/env";
import { prisma } from "../../lib/prisma";
import { IRegistrationPayload } from "./auth.interface";

const register = async (payload: IRegistrationPayload) => {
  const { name, email, password, role } = payload;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("User already exists with this email");
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
