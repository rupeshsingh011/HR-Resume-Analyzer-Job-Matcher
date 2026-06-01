import express from "express";
import { deleteHRUser, getHRStats } from "../controllers/adminController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("Admin"));

router.get("/hr-stats", getHRStats);
router.delete("/hr/:id", deleteHRUser);

export default router;
