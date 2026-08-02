import { Router } from "express";
import { db } from "../config/db.js";

const router: Router = Router();

router.get("/health", async (_, res) => {
  await db.query("SELECT 1");

  res.json({
    success: true,
  });
});

export default router;
