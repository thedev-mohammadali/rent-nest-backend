import { NextFunction, Request, Response } from "express";
import z from "zod";

const validateRequest = <T extends z.ZodType>(schema: T) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
