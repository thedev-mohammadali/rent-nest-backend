import { configDotenv } from "dotenv";
import path from "node:path";

configDotenv({ quiet: true, path: path.join(process.cwd(), ".env") });

const port = Number(process.env.PORT) || 3000;
const dbString = process.env.DATABASE_URL;

if (!dbString) {
  throw new Error("Database connection string not found");
}

export default {
  port,
  dbString,
};
