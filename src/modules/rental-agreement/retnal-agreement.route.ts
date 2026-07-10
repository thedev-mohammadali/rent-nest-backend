import { Router } from "express";
import { UserRole } from "../../generated/prisma/enums";
import authenticate from "../../middlewares/authentication";
import authorize from "../../middlewares/authorization";
import { rentalAgreementcontroller } from "./rental-agreement.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(UserRole.LANDLORD),
  rentalAgreementcontroller.getLandlordRentalAgreements,
);

export const rentalAgreementRoutes = router;
