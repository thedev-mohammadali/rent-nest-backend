import { configDotenv } from "dotenv";
import { SignOptions } from "jsonwebtoken";
import ms from "ms";
import path from "node:path";

configDotenv({ quiet: true, path: path.join(process.cwd(), ".env") });

const port = Number(process.env.PORT) || 3000;
const dbString = process.env.DATABASE_URL;
const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const nodeEnv = process.env.NODE_ENV || "production";

const jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
const jwtAccessExpiresIn =
  (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) || "1d";
const jwtRefreshExpiresIn =
  (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const successUrl = process.env.STRIPE_SUCCESS_URL!;
const cancelUrl = process.env.STRIPE_CANCEL_URL!;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const jwtAccessExpiresMs =
  typeof jwtAccessExpiresIn === "number"
    ? jwtAccessExpiresIn * 1000
    : ms(jwtAccessExpiresIn);
const jwtRefreshExpiresMs =
  typeof jwtRefreshExpiresIn === "number"
    ? jwtRefreshExpiresIn * 1000
    : ms(jwtRefreshExpiresIn);

if (!dbString) {
  throw new Error("Database connection string not found");
}

if (!jwtAccessSecret) {
  throw new Error("JWT access secret is missing");
}

if (!jwtRefreshSecret) {
  throw new Error("JWT refresh secret is missing");
}

if (!stripeSecretKey) {
  throw new Error("Stripe secret key is missing");
}

if (!endpointSecret) {
  throw new Error("Stripe End Point Secret is missing");
}

export default {
  port,
  dbString,
  saltRounds,
  nodeEnv,
  jwtAccessSecret,
  jwtRefreshSecret,
  jwtAccessExpiresIn,
  jwtRefreshExpiresIn,
  jwtAccessExpiresMs,
  jwtRefreshExpiresMs,
  stripeSecretKey,
  successUrl,
  cancelUrl,
  endpointSecret,
};
