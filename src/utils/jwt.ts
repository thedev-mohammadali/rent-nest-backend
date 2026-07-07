import jwt, { JwtPayload } from "jsonwebtoken";
import env from "../config/env";
import { UserRole } from "../generated/prisma/enums";

export type JwtTokenPayload = JwtPayload & {
  userId: string;
  role: UserRole;
};

export const generateAccessToken = (payload: JwtTokenPayload) => {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });
};

export const generateRefreshToken = (payload: JwtTokenPayload) => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
};
