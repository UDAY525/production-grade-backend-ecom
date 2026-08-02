import { Router } from "express";
import { AuthController } from "./auth.controller";
import { asyncHandler } from "../../common/middleware/asyncHandler";

const router = Router();
const controller = new AuthController();

router.post("/register", asyncHandler(controller.register.bind(controller)));
export default router;
