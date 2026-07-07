import { Router } from "express";
import { UserRole } from "../../generated/prisma/enums";
import authenticate from "../../middlewares/authentication";
import authorize from "../../middlewares/authorization";
import validateRequest from "../../middlewares/validateRequest";
import { landlordController } from "./landlord.controller";
import { createPropertyListingSchema } from "./landlord.validate";

const router = Router();

router.post(
  "/properties",
  authenticate,
  authorize(UserRole.LANDLORD),
  validateRequest(createPropertyListingSchema),
  landlordController.createPropertyListing,
);

export const landlordRoutes = router;
