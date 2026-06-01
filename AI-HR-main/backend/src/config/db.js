import { getMongoUri } from "./env.js";
import "./env.js";
import mongoose from "mongoose";

export async function connectDB() {
  const uri = getMongoUri();

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000
    });
    const host = mongoose.connection.host;
    const dbName = mongoose.connection.name;
    console.log(`MongoDB connected (${dbName} @ ${host})`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    if (uri.startsWith("mongodb+srv://")) {
      console.error(
        "Atlas checklist: cluster is running, database user exists, password is URL-encoded, and your IP is allowed under Network Access."
      );
    }
    throw error;
  }
}
