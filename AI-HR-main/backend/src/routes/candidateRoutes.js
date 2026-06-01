import express from "express";
import {
  exportCandidateReport,
  getCandidate,
  getCandidateResume,
  listCandidates,
  rematchCandidate,
  shortlistCandidate,
  uploadCandidateResumes,
  deleteCandidate,
  addNote,
  deleteNote,
  updateStage
} from "../controllers/candidateController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { uploadResume } from "../middleware/upload.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  message: { message: "Upload limit reached. Please try again later." }
});

router.use(protect);
router.use(restrictTo("Admin", "HR"));
router.get("/", listCandidates);
router.post("/upload", uploadLimiter, uploadResume.array("resumes", 50), uploadCandidateResumes);
router.get("/:id/resume", getCandidateResume);
router.get("/:id", getCandidate);
router.patch("/:id/shortlist", shortlistCandidate);
router.post("/:id/rematch", rematchCandidate);
router.get("/:id/report", exportCandidateReport);
router.delete("/:id", deleteCandidate);
router.post("/:id/notes", addNote);
router.delete("/:id/notes/:noteId", deleteNote);
router.patch("/:id/stage", updateStage);

export default router;
