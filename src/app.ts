import cookieParser from "cookie-parser";
import express from "express";
import status from "http-status";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";
import router from "./routes";

const app = express();

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(status.OK).json({
    success: true,
    message: "Welcome to RentNest.",
  });
});

app.use("/api", router);

app.use(notFound);

app.use(globalErrorHandler);

export default app;
