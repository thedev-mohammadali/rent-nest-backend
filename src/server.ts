import app from "./app";
import env from "./config/env";

const PORT = env.port;

const main = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is listening at port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server.", error);
    process.exit(1);
  }
};

main();
