import "../src/config/env.js";
import mongoose from "mongoose";
import Candidate from "../src/models/Candidate.js";
import Job from "../src/models/Job.js";
import User from "../src/models/User.js";
import { generateCandidateInsights } from "../src/services/aiService.js";
import { matchCandidateToJob } from "../src/services/matchingService.js";
import { getMongoUri } from "../src/config/env.js";

const jobs = [
  {
    title: "Senior Full Stack Engineer",
    department: "Product Engineering",
    description: "Build React, Node.js, Express and MongoDB applications with strong API design and cloud deployment practices.",
    requiredSkills: ["React", "Node.js", "Express", "MongoDB", "AWS"],
    preferredEducation: "Bachelor",
    minExperienceYears: 5
  },
  {
    title: "AI Product Analyst",
    department: "Data",
    description: "Analyze candidate and product data, use Python, NLP, dashboards and stakeholder communication to improve hiring intelligence.",
    requiredSkills: ["Python", "NLP", "Data Analysis", "Communication"],
    preferredEducation: "Master",
    minExperienceYears: 3
  },
  {
    title: "DevOps Platform Engineer",
    department: "Infrastructure",
    description: "Own CI/CD, Docker, Kubernetes, AWS infrastructure and observability for production services.",
    requiredSkills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    preferredEducation: "Bachelor",
    minExperienceYears: 4
  }
];

const candidates = [
  {
    name: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    phone: "+91 98765 43210",
    skills: ["React", "Node.js", "Express", "MongoDB", "AWS", "REST API"],
    experienceYears: 6,
    workExperience: ["Senior developer building HR SaaS platforms"],
    education: ["Bachelor of Technology in Computer Science"],
    certifications: ["AWS Certified Developer"],
    projects: ["Built a resume ranking dashboard"],
    resumeText: "React Node.js Express MongoDB AWS REST API Bachelor 6 years HR SaaS resume ranking dashboard"
  },
  {
    name: "Maya Iyer",
    email: "maya.iyer@example.com",
    phone: "+91 91234 56789",
    skills: ["Python", "NLP", "Data Analysis", "SQL", "Communication"],
    experienceYears: 4,
    workExperience: ["Data analyst focused on talent analytics"],
    education: ["Master of Science in Data Analytics"],
    certifications: ["Applied Machine Learning Certificate"],
    projects: ["Designed NLP based job description classifier"],
    resumeText: "Python NLP Data Analysis SQL Communication Master 4 years talent analytics classifier"
  }
];

async function seed() {
  await mongoose.connect(getMongoUri());
  await Promise.all([User.deleteMany(), Job.deleteMany(), Candidate.deleteMany()]);

  const admin = await User.create({
    name: "Demo Admin",
    email: "admin@smarthr.local",
    password: "Admin123!",
    role: "Admin"
  });

  const createdJobs = await Job.insertMany(jobs.map((job) => ({ ...job, createdBy: admin._id })));

  for (const data of candidates) {
    const candidate = new Candidate({ ...data, uploadedBy: admin._id });
    candidate.analysis = await generateCandidateInsights(candidate);
    candidate.matches = createdJobs.map((job) => matchCandidateToJob(candidate, job)).sort((a, b) => b.score - a.score);
    await candidate.save();
  }

  console.log("Seeded demo data");
  console.log("Login: admin@smarthr.local / Admin123!");
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
