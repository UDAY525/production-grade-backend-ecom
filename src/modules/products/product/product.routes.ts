import { Router } from "express";

import { asyncHandler } from "../../../common/middleware/asyncHandler";
import { authorize } from "../../../common/middleware/role.middleware";
import { protect } from "../../../common/middleware/auth.middleware";

import { ProductController } from "./product.controller";

const router = Router();
const controller = new ProductController();

router.post(
  "/",
  protect,
  authorize("seller", "admin"),
  asyncHandler(controller.create.bind(controller)),
);

router.get("/", asyncHandler(controller.getAll.bind(controller)));
router.get("/:id", asyncHandler(controller.getById.bind(controller)));
router.patch(
  "/:id",
  protect,
  authorize("seller", "admin"),
  asyncHandler(controller.update.bind(controller)),
);
router.delete(
  "/:id",
  protect,
  authorize("seller", "admin"),
  asyncHandler(controller.archive.bind(controller)),
);
router.get(
  "/mine",
  protect,
  authorize("seller", "admin"),
  asyncHandler(controller.getMine.bind(controller)),
);

router.get("/:id", asyncHandler(controller.getById.bind(controller)));

export default router;
