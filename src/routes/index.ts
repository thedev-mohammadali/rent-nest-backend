import { Router } from "express";
import { adminRoutes } from "../modules/admin/admin.route";
import { authRoutes } from "../modules/auth/auth.route";
import { categoryRoutes } from "../modules/category/category.route";
import { paymentRoutes } from "../modules/payment/payment.route";
import { propertyRoutes } from "../modules/property/property.route";
import { rentalAgreementRoutes } from "../modules/rental-agreement/retnal-agreement.route";
import { rentalRequestRoutes } from "../modules/rental-request/retnal-request.route";
import { reviewRoutes } from "../modules/review/review.route";
import { tenantRoutes } from "../modules/tenant/tenant.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tenant", tenantRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/properties", propertyRoutes);
router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/rental-agreements", rentalAgreementRoutes);
router.use("/rental-requests", rentalRequestRoutes);

export default router;
