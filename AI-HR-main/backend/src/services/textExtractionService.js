import fs from "fs/promises";
import mammoth from "mammoth";
import pdf from "pdf-parse";

export async function extractTextFromResume(file) {
  if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
    const buffer = await fs.readFile(file.path);
    const parsed = await pdf(buffer);
    return parsed.text;
  }

  const result = await mammoth.extractRawText({ path: file.path });
  return result.value;
}
