import express from "express";
import { 
  login, 
  me, 
  register, 
  updateProfile, 
  googleLogin, 
  forgotPassword, 
  resetPassword 
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: "Too many attempts, please try again later." }
});

router.post("/register", register);
router.post("/login", authLimiter, login);
router.post("/google", googleLogin);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", protect, me);
router.patch("/me", protect, updateProfile);

export default router;
