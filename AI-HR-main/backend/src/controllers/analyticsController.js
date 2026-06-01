import Candidate from "../models/Candidate.js";

export async function getAnalytics(req, res, next) {
  try {
    const query = req.user.role === "Admin" ? {} : { uploadedBy: req.user._id };
    const candidates = await Candidate.find(query);
    const total = candidates.length;
    const shortlisted = candidates.filter((candidate) => candidate.shortlisted).length;
    const averageScore = Math.round(
      candidates.reduce((sum, candidate) => sum + (candidate.matches?.[0]?.score || 0), 0) / Math.max(total, 1)
    );

    const skillCounts = candidates.flatMap((candidate) => candidate.skills || []).reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

    const commonSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    const distribution = {
      junior: candidates.filter((candidate) => candidate.experienceYears < 3).length,
      mid: candidates.filter((candidate) => candidate.experienceYears >= 3 && candidate.experienceYears < 7).length,
      senior: candidates.filter((candidate) => candidate.experienceYears >= 7).length
    };

    res.json({ total, shortlisted, averageScore, commonSkills, distribution });
  } catch (error) {
    next(error);
  }
}
