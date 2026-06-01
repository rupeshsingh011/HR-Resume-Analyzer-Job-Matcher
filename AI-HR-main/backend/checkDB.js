import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";

dotenv.config();

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: "admin@gmail.com" }).select("+password");
    if (!user) {
      console.log("Admin NOT found");
    } else {
      console.log("Admin found:", {
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        passwordHash: user.password
      });
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkAdmin();
