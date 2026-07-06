import { ErrorRequestHandler } from "express";
import status from "http-status";
import env from "../config/env";
import sendResponse from "../utils/sendResponse";

const development = env.nodeEnv === "development";

const globalErrorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  return sendResponse(res, {
    statusCode: status.INTERNAL_SERVER_ERROR,
    success: false,
    message: "Something went wrong",
    errorDetails: null,
    errorStack: development ? (error as Error).stack : undefined,
  });
};

export default globalErrorHandler;
