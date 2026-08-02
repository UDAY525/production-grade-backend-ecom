import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import { protect } from "../common/middleware/auth.middleware";
import { ApiResponse } from "../common/response/ApiResponse";

const router = Router();

router.use("/auth", authRoutes);
router.get("/me", protect, (req, res) => {
  res.json(ApiResponse.success(req.user));
});

export default router;
