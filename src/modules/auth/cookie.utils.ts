import { CookieOptions } from "express";
import env from "../../config/env";

export const accessCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.nodeEnv !== "development",
  maxAge: env.jwtAccessExpiresMs,
};

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.nodeEnv !== "development",
  maxAge: env.jwtRefreshExpiresMs,
};
