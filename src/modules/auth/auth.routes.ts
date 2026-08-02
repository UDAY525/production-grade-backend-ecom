import { Router } from "express";
import { AuthController } from "./auth.controller";
import { asyncHandler } from "../../common/middleware/asyncHandler";

const router = Router();
const controller = new AuthController();

router.post("/register", asyncHandler(controller.register.bind(controller)));
router.post("/login", asyncHandler(controller.login.bind(controller)));
router.post("/refresh", asyncHandler(controller.refresh.bind(controller)));
router.post("/logout", asyncHandler(controller.logout.bind(controller)));
export default router;
