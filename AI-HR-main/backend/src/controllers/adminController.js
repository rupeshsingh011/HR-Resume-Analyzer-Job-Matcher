import Candidate from "../models/Candidate.js";
import Job from "../models/Job.js";
import User from "../models/User.js";

export async function getHRStats(req, res, next) {
  try {
    const hrUsers = await User.find({ role: "HR" }).select("-password -__v").lean();

    const stats = await Promise.all(
      hrUsers.map(async (user) => {
        const candidateCount = await Candidate.countDocuments({ uploadedBy: user._id });
        const jobCount = await Job.countDocuments({ createdBy: user._id });
        const shortlistedCount = await Candidate.countDocuments({ uploadedBy: user._id, shortlisted: true });

        return {
          ...user,
          candidateCount,
          jobCount,
          shortlistedCount
        };
      })
    );

    res.json({ hrStats: stats });
  } catch (error) {
    next(error);
  }
}

export async function deleteHRUser(req, res, next) {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: "HR" });
    if (!user) return res.status(404).json({ message: "HR User not found" });

    // Optionally delete their data, or leave it orphaned/assigned to Admin
    await Candidate.deleteMany({ uploadedBy: user._id });
    await Job.deleteMany({ createdBy: user._id });

    res.json({ message: "HR user and all associated data deleted successfully" });
  } catch (error) {
    next(error);
  }
}
