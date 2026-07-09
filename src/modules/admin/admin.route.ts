import { Router } from "express";
import { UserRole } from "../../generated/prisma/enums";
import authenticate from "../../middlewares/authentication";
import authorize from "../../middlewares/authorization";
import { adminController } from "./admin.controller";

const router = Router();

router.get(
  "/users",
  authenticate,
  authorize(UserRole.ADMIN),
  adminController.getAllUsers,
);

export const adminRoutes = router;
