import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    summary: String,
    strengths: [String],
    weaknesses: [String],
    skillGaps: [String],
    bestFitRoles: [String],
    interviewQuestions: [String]
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    jobTitle: String,
    score: Number,
    reasoning: String,
    missingSkills: [String],
    recommendedRoles: [String],
    breakdown: {
      skillOverlap: Number,
      experienceRelevance: Number,
      educationFit: Number,
      keywordSimilarity: Number
    }
  },
  { timestamps: true }
);

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0 },
    workExperience: [String],
    education: [String],
    certifications: [String],
    projects: [String],
    resumeText: String,
    resumeFile: {
      originalName: String,
      path: String,
      mimeType: String
    },
    analysis: analysisSchema,
    matches: [matchSchema],
    shortlisted: { type: Boolean, default: false },
    stage: { type: String, enum: ["new", "reviewing", "shortlisted", "interview", "hired", "rejected"], default: "new" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: [{
      text: { type: String, required: true },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

candidateSchema.index({ name: "text", skills: "text", resumeText: "text" });
candidateSchema.index({ uploadedBy: 1, createdAt: -1 });
candidateSchema.index({ experienceYears: -1 });
candidateSchema.index({ "matches.score": -1 });
candidateSchema.index({ skills: 1 });
export default mongoose.model("Candidate", candidateSchema);
