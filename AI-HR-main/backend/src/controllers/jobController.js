import { z } from "zod";
import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";
import { matchCandidateToJob } from "../services/matchingService.js";

const jobSchema = z.object({
  title: z.string().min(2),
  department: z.string().min(2),
  description: z.string().min(10),
  requiredSkills: z.array(z.string()).default([]),
  preferredEducation: z.string().optional(),
  minExperienceYears: z.number().min(0).default(0)
});

export async function createJob(req, res, next) {
  try {
    const data = jobSchema.parse(req.body);
    const job = await Job.create({ ...data, createdBy: req.user._id });

    const candidates = await Candidate.find({}, "_id skills experienceYears resumeText education");
    await Promise.all(candidates.map(async (candidate) => {
      const match = matchCandidateToJob(candidate, job);
      await Candidate.updateOne(
        { _id: candidate._id },
        { 
          $push: { 
            matches: { 
              $each: [match], 
              $sort: { score: -1 } 
            } 
          } 
        }
      );
    }));

    res.status(201).json({ job });
  } catch (error) {
    next(error);
  }
}

export async function listJobs(req, res, next) {
  try {
    const query = req.user.role === "Admin" ? {} : { createdBy: req.user._id };
    const jobs = await Job.find(query).sort("-createdAt");
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
}

export async function rankCandidatesForJob(req, res, next) {
  try {
    const jobQuery = req.user.role === "Admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    const job = await Job.findOne(jobQuery);
    if (!job) return res.status(404).json({ message: "Job not found" });
    const candidateQuery = req.user.role === "Admin" ? {} : { uploadedBy: req.user._id };
    const candidates = await Candidate.find(candidateQuery);
    const ranking = candidates
      .map((candidate) => ({ candidate, match: matchCandidateToJob(candidate, job) }))
      .sort((a, b) => b.match.score - a.match.score);
    res.json({ job, ranking });
  } catch (error) {
    next(error);
  }
}

export async function updateJob(req, res, next) {
  try {
    const query = req.user.role === "Admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    const { title, department, description, requiredSkills, preferredEducation, minExperienceYears } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (department !== undefined) updateData.department = department.trim();
    if (description !== undefined) updateData.description = description;
    if (requiredSkills !== undefined) updateData.requiredSkills = requiredSkills;
    if (preferredEducation !== undefined) updateData.preferredEducation = preferredEducation?.trim();
    if (minExperienceYears !== undefined) updateData.minExperienceYears = Number(minExperienceYears);
    const job = await Job.findOneAndUpdate(query, updateData, { new: true });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ job });
  } catch (error) {
    next(error);
  }
}

export async function toggleJobStatus(req, res, next) {
  try {
    const query = req.user.role === "Admin" ? { _id: req.params.id } : { _id: req.params.id, createdBy: req.user._id };
    const job = await Job.findOne(query);
    if (!job) return res.status(404).json({ message: "Job not found" });
    job.status = job.status === "open" ? "closed" : "open";
    await job.save();
    res.json({ job });
  } catch (error) {
    next(error);
  }
}

