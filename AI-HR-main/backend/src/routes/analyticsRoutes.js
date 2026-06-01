import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("Admin", "HR"));
router.get("/", getAnalytics);

export default router;
