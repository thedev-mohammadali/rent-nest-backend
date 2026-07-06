import { ErrorRequestHandler } from "express";
import status from "http-status";
import env from "../config/env";
import AppError from "../utils/AppError";
import sendResponse from "../utils/sendResponse";

const development = env.nodeEnv === "development";

const globalErrorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (error instanceof AppError) {
    return sendResponse(res, {
      statusCode: error.statusCode,
      success: false,
      message: error.message,
      errorDetails: error.errorDetails,
      errorStack: development ? error.stack : undefined,
    });
  }

  return sendResponse(res, {
    statusCode: status.INTERNAL_SERVER_ERROR,
    success: false,
    message: development ? (error as Error).message : "Something went wrong",
    errorDetails: null,
    errorStack: development ? (error as Error).stack : undefined,
  });
};

export default globalErrorHandler;
