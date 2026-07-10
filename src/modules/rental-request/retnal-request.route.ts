import { Router } from "express";
import { UserRole } from "../../generated/prisma/enums";
import authenticate from "../../middlewares/authentication";
import authorize from "../../middlewares/authorization";
import validateRequest from "../../middlewares/validateRequest";
import { rentalRequestController } from "./rental-request.controller";
import { updateRentalRequestStatusSchema } from "./rental-request.validation";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(UserRole.LANDLORD),
  rentalRequestController.getRentalRequests,
);

router.patch(
  "/:id",
  authenticate,
  authorize(UserRole.LANDLORD),
  validateRequest(updateRentalRequestStatusSchema),
  rentalRequestController.updateRentalRequestStatus,
);

export const rentalRequestRoutes = router;
