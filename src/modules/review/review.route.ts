import { Router } from "express";
import { UserRole } from "../../generated/prisma/enums";
import authenticate from "../../middlewares/authentication";
import authorize from "../../middlewares/authorization";
import { reviewController } from "./review.controller";

const router = Router();

router.post(
  "/:rentalAgreementId",
  authenticate,
  authorize(UserRole.TENANT),
  reviewController.createReview,
);

export const reviewRoutes = router;
