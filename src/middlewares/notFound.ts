import { Request, Response } from "express";
import status from "http-status";
import sendResponse from "../utils/sendResponse";

const notFound = (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: status.NOT_FOUND,
    success: false,
    message: "Route not found",
    errorDetails: [
      {
        message: `${req.method} ${req.originalUrl} not found`,
      },
    ],
  });
};

export default notFound;
