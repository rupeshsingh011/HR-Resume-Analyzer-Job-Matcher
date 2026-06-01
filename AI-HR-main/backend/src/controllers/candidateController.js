import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";
import { generateCandidateInsights, parseResumeWithAI } from "../services/aiService.js";
import { matchCandidateToJob } from "../services/matchingService.js";
import { extractTextFromResume } from "../services/textExtractionService.js";
import fs from "fs/promises";
import { validateFileSignature } from "../utils/fileValidation.js";
import { createReadStream } from "fs";
import { normalizeResumeStoragePath, findResumeFileOnDisk } from "../utils/resumePath.js";
import { sendEmail } from "../services/emailService.js";

export async function uploadCandidateResumes(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "Resume files are required" });

    const jobQuery = req.user.role === "Admin" ? {} : { createdBy: req.user._id };
    const jobs = await Job.find(jobQuery, "_id title requiredSkills minExperienceYears preferredEducation description");

    const candidateDocsToInsert = [];
    const existingCandidates = [];

    const processPromises = req.files.map(async (file) => {
      try {
        const isValid = await validateFileSignature(file.path);
        if (!isValid) {
          await fs.unlink(file.path).catch(() => {});
          console.error(`Invalid magic number for file ${file.originalname}`);
          return;
        }

        const resumeText = await extractTextFromResume(file);
        const parsed = await parseResumeWithAI(resumeText);

        const query = { uploadedBy: req.user._id };
        if (parsed.email) {
          query.email = parsed.email;
        } else {
          query.name = parsed.name;
          query["resumeFile.originalName"] = file.originalname;
        }

        const existing = await Candidate.findOne(query);
        if (existing) {
          existing.set({
            ...parsed,
            resumeText,
            resumeFile: {
              originalName: file.originalname,
              path: normalizeResumeStoragePath(file),
              mimeType: file.mimetype
            }
          });
          existing.analysis = await generateCandidateInsights(existing.toObject());
          existing.matches = jobs
            .map((job) => matchCandidateToJob(existing.toObject(), job))
            .sort((a, b) => b.score - a.score);
          await existing.save();
          existingCandidates.push(existing);
          return;
        }

        const candidateData = {
          ...parsed,
          resumeText,
          resumeFile: {
            originalName: file.originalname,
            path: normalizeResumeStoragePath(file),
            mimeType: file.mimetype
          },
          uploadedBy: req.user._id
        };

        candidateData.analysis = await generateCandidateInsights(candidateData);
        candidateData.matches = jobs.map((job) => matchCandidateToJob(candidateData, job)).sort((a, b) => b.score - a.score);
        candidateDocsToInsert.push(candidateData);
      } catch (err) {
        console.error("Error processing file", file.originalname, err);
      }
    });

    await Promise.all(processPromises);

    let insertedCandidates = [];
    if (candidateDocsToInsert.length > 0) {
      insertedCandidates = await Candidate.insertMany(candidateDocsToInsert);
    }

    const totalSaved = existingCandidates.length + insertedCandidates.length;
    if (totalSaved === 0 && req.files.length > 0) {
      return res.status(422).json({
        message: "No resumes were saved. Check file format (PDF/DOCX) and backend logs.",
        candidates: []
      });
    }

    res.status(201).json({
      candidates: [...existingCandidates, ...insertedCandidates],
      inserted: insertedCandidates.length,
      updated: existingCandidates.length
    });
  } catch (error) {
    next(error);
  }
}

export async function listCandidates(req, res, next) {
  try {
    const { skill, minExperience, minScore, sort = "-createdAt", page = 1, limit = 12 } = req.query;
    const query = req.user.role === "Admin" ? {} : { uploadedBy: req.user._id };
    if (skill) {
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.skills = { $regex: escapedSkill, $options: "i" };
    }
    if (minExperience) query.experienceYears = { $gte: Number(minExperience) };
    if (minScore) query["matches.score"] = { $gte: Number(minScore) };

    const skip = (Number(page) - 1) * Number(limit);
    const [candidates, total] = await Promise.all([
      Candidate.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Candidate.countDocuments(query)
    ]);
    res.json({ candidates, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    next(error);
  }
}

export async function getCandidate(req, res, next) {
  try {
    const query = req.user.role === "Admin" ? { _id: req.params.id } : { _id: req.params.id, uploadedBy: req.user._id };
    const candidate = await Candidate.findOne(query).populate("matches.job");
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json({ candidate });
  } catch (error) {
    next(error);
  }
}

export async function getCandidateResume(req, res, next) {
  try {
    const query = req.user.role === "Admin" ? { _id: req.params.id } : { _id: req.params.id, uploadedBy: req.user._id };
    const candidate = await Candidate.findOne(query);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    if (!candidate.resumeFile?.path) {
      return res.status(404).json({ message: "No resume file for this candidate" });
    }

    const absolutePath = await findResumeFileOnDisk(candidate.resumeFile.path);

    const originalName = candidate.resumeFile.originalName || "resume";
    const mimeType = candidate.resumeFile.mimeType || "application/octet-stream";
    const isPdf = mimeType === "application/pdf" || originalName.toLowerCase().endsWith(".pdf");

    res.setHeader("Content-Type", isPdf ? "application/pdf" : mimeType);
    res.setHeader("Content-Disposition", `${isPdf ? "inline" : "attachment"}; filename="${originalName.replace(/"/g, "")}"`);
    res.setHeader("Cache-Control", "private, max-age=3600");

    const stream = createReadStream(absolutePath);
    stream.on("error", (streamError) => {
      if (!res.headersSent) {
        if (streamError.code === "ENOENT") {
          return res.status(404).json({ message: "Resume file not found on server" });
        }
        next(streamError);
      }
    });
    stream.pipe(res);
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ message: "Resume file not found on server" });
    }
    next(error);
  }
}

export async function shortlistCandidate(req, res, next) {
  try {
    const query = req.user.role === "Admin" ? { _id: req.params.id } : { _id: req.params.id, uploadedBy: req.user._id };
    const isShortlisting = req.body.shortlisted ?? true;
    const candidate = await Candidate.findOneAndUpdate(
      query,
      { shortlisted: isShortlisting },
      { new: true }
    ).populate("matches.job");
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    if (isShortlisting && candidate.email) {
      await sendEmail({
        to: candidate.email,
        subject: "Interview Invitation - Smart HR",
        text: `Hi ${candidate.name},\n\nWe are excited to inform you that your resume has been shortlisted! Our HR team will reach out to you shortly to schedule an interview.\n\nBest regards,\nSmart HR Team`
      });
    }

    res.json({ candidate });
  } catch (error) {
    next(error);
  }
}

export async function rematchCandidate(req, res, next) {
  try {
    const query = req.user.role === "Admin" ? { _id: req.params.id } : { _id: req.params.id, uploadedBy: req.user._id };
    const candidate = await Candidate.findOne(query);
    const jobQuery = req.user.role === "Admin" ? {} : { createdBy: req.user._id };
    const jobs = await Job.find(jobQuery);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    candidate.matches = jobs.map((job) => matchCandidateToJob(candidate, job)).sort((a, b) => b.score - a.score);
    await candidate.save();
    res.json({ candidate });
  } catch (error) {
    next(error);
  }
}

export async function exportCandidateReport(req, res, next) {
  try {
    const query = req.user.role === "Admin" ? { _id: req.params.id } : { _id: req.params.id, uploadedBy: req.user._id };
    const candidate = await Candidate.findOne(query);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    const topMatch = candidate.matches?.[0];
    const report = [
      `Smart HR Candidate Report`,
      `Name: ${candidate.name}`,
      `Email: ${candidate.email || "N/A"}`,
      `Experience: ${candidate.experienceYears || 0} years`,
      `Skills: ${(candidate.skills || []).join(", ")}`,
      `Summary: ${candidate.analysis?.summary || ""}`,
      `Top Match: ${topMatch ? `${topMatch.jobTitle} (${topMatch.score}%)` : "No job match yet"}`,
      `Reasoning: ${topMatch?.reasoning || ""}`
    ].join("\n\n");

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="${candidate.name.replace(/\s+/g, "_")}_report.txt"`);
    res.send(report);
  } catch (error) {
    next(error);
  }
}

export async function deleteCandidate(req, res, next) {
  try {
    const query = req.user.role === "Admin" ? { _id: req.params.id } : { _id: req.params.id, uploadedBy: req.user._id };
    const candidate = await Candidate.findOneAndDelete(query);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json({ message: "Candidate deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function addNote(req, res, next) {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Note text is required" });
    const query = req.user.role === "Admin" ? { _id: req.params.id } : { _id: req.params.id, uploadedBy: req.user._id };
    const candidate = await Candidate.findOneAndUpdate(
      query,
      { $push: { notes: { text: text.trim(), createdBy: req.user._id } } },
      { new: true }
    );
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json({ notes: candidate.notes });
  } catch (error) {
    next(error);
  }
}

export async function deleteNote(req, res, next) {
  try {
    const query = req.user.role === "Admin" ? { _id: req.params.id } : { _id: req.params.id, uploadedBy: req.user._id };
    const candidate = await Candidate.findOneAndUpdate(
      query,
      { $pull: { notes: { _id: req.params.noteId } } },
      { new: true }
    );
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json({ notes: candidate.notes });
  } catch (error) {
    next(error);
  }
}

export async function updateStage(req, res, next) {
  try {
    const { stage } = req.body;
    const validStages = ["new", "reviewing", "shortlisted", "interview", "hired", "rejected"];
    if (!validStages.includes(stage)) return res.status(400).json({ message: "Invalid stage" });
    const query = req.user.role === "Admin" ? { _id: req.params.id } : { _id: req.params.id, uploadedBy: req.user._id };
    const candidate = await Candidate.findOneAndUpdate(query, { stage }, { new: true });
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json({ candidate });
  } catch (error) {
    next(error);
  }
}


