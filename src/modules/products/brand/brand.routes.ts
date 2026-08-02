import { Router } from "express";
import { asyncHandler } from "../../../common/middleware/asyncHandler";
import { protect } from "../../../common/middleware/auth.middleware";
import { authorize } from "../../../common/middleware/role.middleware";
import { BrandController } from "./brand.controller";

const router = Router();
const controller = new BrandController();

router.post(
  "/",
  protect,
  authorize("admin"),
  asyncHandler(controller.create.bind(controller)),
);

router.get("/", asyncHandler(controller.getAll.bind(controller)));

export default router;
