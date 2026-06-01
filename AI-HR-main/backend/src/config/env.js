import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
dotenv.config({ path: path.join(backendRoot, ".env") });

export function getMongoUri() {
  const uri = process.env.MONGO_URI?.trim();
  if (!uri) {
    throw new Error("MONGO_URI is missing. Add your Atlas connection string to backend/.env");
  }
  if (/127\.0\.0\.1|localhost/.test(uri)) {
    console.warn(
      "WARNING: MONGO_URI points to localhost. Uploads will NOT appear in MongoDB Atlas until you set your Atlas URI in backend/.env and restart the backend."
    );
  }
  return uri;
}

export { backendRoot };
