import { z } from "zod";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";
import { sendResetPasswordEmail } from "../services/emailService.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function register(req, res, next) {
  try {
    const { name, email: rawEmail, password } = registerSchema.parse(req.body);
    const email = rawEmail.toLowerCase();
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({
      name,
      email,
      password,
      isVerified: true,
      role: "HR"
    });

    res.status(201).json({ token: signToken(user), user: sanitize(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ token: signToken(user), user: sanitize(user) });
  } catch (error) {
    next(error);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { sub: googleId, email, name } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        name,
        isVerified: true,
        password: crypto.randomBytes(16).toString("hex"),
        role: "HR"
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.isVerified = true;
      await user.save();
    }

    res.json({ token: signToken(user), user: sanitize(user) });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email: rawEmail } = z.object({ email: z.string().email() }).parse(req.body);
    const email = rawEmail.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await sendResetPasswordEmail(email, token);
    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = z.object({ token: z.string(), password: z.string().min(8) }).parse(req.body);
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: sanitize(req.user) });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (name) user.name = name.trim();
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: "Current password is required" });
      const valid = await user.comparePassword(currentPassword);
      if (!valid) return res.status(400).json({ message: "Incorrect current password" });
      user.password = newPassword;
    }
    await user.save();
    res.json({ user: sanitize(user) });
  } catch (error) {
    next(error);
  }
}

function sanitize(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}
