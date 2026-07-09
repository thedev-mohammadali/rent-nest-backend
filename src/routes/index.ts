import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { landlordRoutes } from "../modules/landlord/landlord.route";
import { paymentRoutes } from "../modules/payment/payment.route";
import { reviewRoutes } from "../modules/review/review.route";
import { tenantRoutes } from "../modules/tenant/tenant.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/landlord", landlordRoutes);
router.use("/tenant", tenantRoutes);
router.use("/payments", paymentRoutes);
router.use("/reviews", reviewRoutes);

export default router;
