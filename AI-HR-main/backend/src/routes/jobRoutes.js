import express from "express";
import { createJob, listJobs, rankCandidatesForJob, toggleJobStatus } from "../controllers/jobController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(restrictTo("Admin", "HR"));
router.get("/", listJobs);
router.post("/", createJob);
router.get("/:id/rankings", rankCandidatesForJob);
router.patch("/:id/toggle-status", toggleJobStatus);

export default router;
