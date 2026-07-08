import { Router } from "express";
import { UserRole } from "../../generated/prisma/enums";
import authenticate from "../../middlewares/authentication";
import authorize from "../../middlewares/authorization";
import validateRequest from "../../middlewares/validateRequest";
import { landlordController } from "./landlord.controller";
import {
  createPropertyListingSchema,
  updatePropertyListingSchema,
} from "./landlord.validate";

const router = Router();

router.get(
  "/properties",
  authenticate,
  authorize(UserRole.LANDLORD),
  landlordController.getMyProperties,
);

router.post(
  "/properties",
  authenticate,
  authorize(UserRole.LANDLORD),
  validateRequest(createPropertyListingSchema),
  landlordController.createPropertyListing,
);

router.patch(
  "/properties/:id",
  authenticate,
  authorize(UserRole.LANDLORD),
  validateRequest(updatePropertyListingSchema),
  landlordController.editPropertyListing,
);

router.delete(
  "/properties/:id",
  authenticate,
  authorize(UserRole.LANDLORD),
  landlordController.deletePropertyListing,
);

router.get(
  "/properties/:id",
  authenticate,
  authorize(UserRole.LANDLORD),
  landlordController.getMyPropertyById,
);

router.patch(
  "/properties/update-status/:id",
  authenticate,
  authorize(UserRole.LANDLORD),
  landlordController.updateMyPropertyAvailabilityStatus,
);

router.get(
  "/rental-requests",
  authenticate,
  authorize(UserRole.LANDLORD),
  landlordController.getRentalRequests,
);

router.patch(
  "/rental-requests/:id",
  authenticate,
  authorize(UserRole.LANDLORD),
  landlordController.updateRentalRequestStatus,
);

export const landlordRoutes = router;
