import express from "express";
import status from "http-status";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import router from "./routes";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(status.OK).json({
    success: true,
    message: "Welcome to RentNest.",
  });
});

app.use("/api", router);

app.use(globalErrorHandler);

export default app;
