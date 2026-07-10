import { Router } from "express";
import { UserRole } from "../../generated/prisma/enums";
import authenticate from "../../middlewares/authentication";
import authorize from "../../middlewares/authorization";
import validateRequest from "../../middlewares/validateRequest";
import { tenantController } from "./tenant.controller";
import {
  submitRentalRequestSchema,
  updateRentalAgreementStatusSchema,
} from "./tenant.validate";

const router = Router();

router.post(
  "/rental-requests",
  authenticate,
  authorize(UserRole.TENANT),
  validateRequest(submitRentalRequestSchema),
  tenantController.submitRentalRequest,
);

router.patch(
  "/rental-agreements/:agreementId/update",
  authenticate,
  authorize(UserRole.TENANT),
  validateRequest(updateRentalAgreementStatusSchema),
  tenantController.updateRentalAgreementStatus,
);

router.get(
  "/rental-requests/me",
  authenticate,
  authorize(UserRole.TENANT),
  tenantController.getTenantRentalRequests,
);

export const tenantRoutes = router;
