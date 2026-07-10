import { Router } from "express";
import { adminRoutes } from "../modules/admin/admin.route";
import { authRoutes } from "../modules/auth/auth.route";
import { categoryRoutes } from "../modules/category/category.route";
import { paymentRoutes } from "../modules/payment/payment.route";
import { propertyRoutes } from "../modules/property/property.route";
import { rentalAgreementRoutes } from "../modules/rental-agreement/rental-agreement.route";
import { rentalRequestRoutes } from "../modules/rental-request/rental-request.route";
import { reviewRoutes } from "../modules/review/review.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/properties", propertyRoutes);
router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/rental-agreements", rentalAgreementRoutes);
router.use("/rental-requests", rentalRequestRoutes);

export default router;
