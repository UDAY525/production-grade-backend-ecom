import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import { protect } from "../common/middleware/auth.middleware";
import { ApiResponse } from "../common/response/ApiResponse";
import brandRoutes from "../modules/products/brand/brand.routes";
import categoryRoutes from "../modules/products/category/category.routes";

const router = Router();

router.use("/auth", authRoutes);
router.get("/me", protect, (req, res) => {
  res.json(ApiResponse.success(req.user));
});

router.use("/brands", brandRoutes);
router.use("/categories", categoryRoutes);

export default router;
