import { Router } from "express";
import { UserRole } from "../../generated/prisma/enums";
import authenticate from "../../middlewares/authentication";
import authorize from "../../middlewares/authorization";
import validateRequest from "../../middlewares/validateRequest";
import { tenantController } from "./tenant.controller";
import { submitRentalRequestSchema } from "./tenant.validate";

const router = Router();

router.post(
  "/rental-request",
  authenticate,
  authorize(UserRole.TENANT),
  validateRequest(submitRentalRequestSchema),
  tenantController.submitRentalRequest,
);

export const tenantRoutes = router;
