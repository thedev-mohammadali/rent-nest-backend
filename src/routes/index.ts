import { Router } from "express";
import { adminRoutes } from "../modules/admin/admin.route";
import { authRoutes } from "../modules/auth/auth.route";
import { categoryRoutes } from "../modules/category/category.route";
import { landlordRoutes } from "../modules/landlord/landlord.route";
import { paymentRoutes } from "../modules/payment/payment.route";
import { propertyRoutes } from "../modules/property/property.route";
import { reviewRoutes } from "../modules/review/review.route";
import { tenantRoutes } from "../modules/tenant/tenant.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/landlord", landlordRoutes);
router.use("/tenant", tenantRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);
router.use("/properties", propertyRoutes);
router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/rental-agreements", categoryRoutes);

export default router;
