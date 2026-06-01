import fs from "fs/promises";
import path from "path";

export function normalizeResumeStoragePath(file) {
  return path.posix.join("src/uploads", file.filename);
}

export function resolveResumeAbsolutePath(storedPath) {
  const normalized = storedPath.replace(/\\/g, "/");
  if (path.isAbsolute(storedPath)) return storedPath;
  return path.resolve(process.cwd(), normalized.replace(/\//g, path.sep));
}

/** Resolve stored path to an existing file (handles legacy Windows paths and filename-only fallbacks). */
export async function findResumeFileOnDisk(storedPath) {
  const fileName = path.basename(storedPath.replace(/\\/g, "/"));
  const candidates = [
    resolveResumeAbsolutePath(storedPath),
    path.resolve(process.cwd(), "src", "uploads", fileName)
  ];

  for (const candidatePath of candidates) {
    try {
      await fs.access(candidatePath);
      return candidatePath;
    } catch {
      // try next
    }
  }

  const error = new Error("Resume file not found on server");
  error.code = "ENOENT";
  throw error;
}
