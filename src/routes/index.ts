import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route";
import { landlordRoutes } from "../modules/landlord/landlord.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/landlord", landlordRoutes);

export default router;
