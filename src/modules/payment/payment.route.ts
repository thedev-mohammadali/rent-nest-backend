import { Router } from "express";
import { UserRole } from "../../generated/prisma/enums";
import authenticate from "../../middlewares/authentication";
import authorize from "../../middlewares/authorization";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/webhook", paymentController.handleStripeWebhook);

router.post(
  "/rental-agreements/:agreementId/checkout",
  authenticate,
  authorize(UserRole.TENANT),
  paymentController.createCheckoutSession,
);

export const paymentRoutes = router;
