import app from "./app";
import env from "./config/env";
import { prisma } from "./lib/prisma";

const PORT = env.port;

const main = async () => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    console.log("Database connected.");

    app.listen(PORT, () => {
      console.log(`Server is listening at port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server.", error);
    process.exit(1);
  }
};

main();
