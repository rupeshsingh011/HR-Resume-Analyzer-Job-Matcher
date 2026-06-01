import { inferRoles } from "./aiService.js";

const normalize = (value) => String(value || "").toLowerCase();
const tokenize = (text) => new Set(normalize(text).match(/[a-z0-9+#.]+/g) || []);

function overlapScore(candidateSkills, jobSkills) {
  if (!jobSkills.length) return 0;
  const candidate = candidateSkills.map(normalize);
  const matched = jobSkills.filter((skill) =>
    candidate.some((candidateSkill) => candidateSkill.includes(normalize(skill)) || normalize(skill).includes(candidateSkill))
  );
  return { score: matched.length / jobSkills.length, missing: jobSkills.filter((skill) => !matched.includes(skill)) };
}

function experienceScore(candidateYears, requiredYears) {
  if (!requiredYears) return 1;
  return Math.min(candidateYears / requiredYears, 1);
}

function educationScore(education, preferredEducation) {
  if (!preferredEducation) return 1;
  const haystack = education.join(" ").toLowerCase();
  return haystack.includes(preferredEducation.toLowerCase()) ? 1 : 0.45;
}

function keywordSimilarity(resumeText, jobText) {
  const resumeTokens = tokenize(resumeText);
  const jobTokens = tokenize(jobText);
  if (!jobTokens.size) return 0;
  const intersection = [...jobTokens].filter((token) => resumeTokens.has(token)).length;
  return intersection / jobTokens.size;
}

export function matchCandidateToJob(candidate, job) {
  const skill = overlapScore(candidate.skills || [], job.requiredSkills || []);
  const exp = experienceScore(candidate.experienceYears || 0, job.minExperienceYears || 0);
  const edu = educationScore(candidate.education || [], job.preferredEducation);
  const keyword = keywordSimilarity(candidate.resumeText || "", `${job.title} ${job.description} ${(job.requiredSkills || []).join(" ")}`);

  const score = Math.round((skill.score * 40 + exp * 30 + edu * 10 + keyword * 20) * 100) / 100;
  const recommendedRoles = inferRoles(candidate.skills || [], candidate.experienceYears || 0);

  return {
    job: job._id,
    jobTitle: job.title,
    score: Math.min(100, Math.round(score)),
    reasoning: [
      `Skill alignment contributed ${Math.round(skill.score * 40)} of 40 points.`,
      `Experience fit contributed ${Math.round(exp * 30)} of 30 points.`,
      `Education fit contributed ${Math.round(edu * 10)} of 10 points.`,
      `Keyword similarity contributed ${Math.round(keyword * 20)} of 20 points.`
    ].join(" "),
    missingSkills: skill.missing,
    recommendedRoles,
    breakdown: {
      skillOverlap: Math.round(skill.score * 40),
      experienceRelevance: Math.round(exp * 30),
      educationFit: Math.round(edu * 10),
      keywordSimilarity: Math.round(keyword * 20)
    }
  };
}
