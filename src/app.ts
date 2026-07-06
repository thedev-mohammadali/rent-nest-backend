import express from "express";
import status from "http-status";
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

export default app;
