import { configDotenv } from "dotenv";
import path from "node:path";

configDotenv({ quiet: true, path: path.join(process.cwd(), ".env") });

const port = Number(process.env.PORT) || 3000;
const dbString = process.env.DATABASE_URL;
const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const nodeEnv = process.env.NODE_ENV || "production";

if (!dbString) {
  throw new Error("Database connection string not found");
}

export default {
  port,
  dbString,
  saltRounds,
  nodeEnv,
};
