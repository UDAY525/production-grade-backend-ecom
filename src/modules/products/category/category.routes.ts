import { Router } from "express";
import { asyncHandler } from "../../../common/middleware/asyncHandler";
import { protect } from "../../../common/middleware/auth.middleware";
import { authorize } from "../../../common/middleware/role.middleware";
import { CategoryController } from "./category.controller";

const router = Router();
const controller = new CategoryController();

router.post(
  "/",
  protect,
  authorize("admin"),
  asyncHandler(controller.create.bind(controller)),
);

router.get("/", asyncHandler(controller.getAll.bind(controller)));

export default router;
