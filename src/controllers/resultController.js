import Result from "../models/Result.js";
import Child from "../models/Child.js";
import User from "../models/User.js";

// Compute letter grade from score
const computeGrade = (score) => {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";
  return "F";
};

// @desc    Create/update result for a child (admin only)
export const upsertResult = async (req, res) => {
  try {
    const { childId, term, year, subjects, position, teacherRemarks } =
      req.body;

    if (!childId || !term || !year || !Array.isArray(subjects)) {
      return res.status(400).json({
        success: false,
        message: "childId, term, year, and subjects[] are required",
      });
    }

    const child = await Child.findById(childId);
    if (!child) {
      return res
        .status(404)
        .json({ success: false, message: "Child not found" });
    }

    // Compute letter grades + average
    const enrichedSubjects = subjects.map((s) => ({
      name: s.name,
      score: s.score,
      grade: computeGrade(s.score),
    }));

    const average =
      enrichedSubjects.reduce((sum, s) => sum + s.score, 0) /
      enrichedSubjects.length;

    const result = await Result.findOneAndUpdate(
      { childId, term, year },
      {
        childId,
        term,
        year,
        subjects: enrichedSubjects,
        average: Number(average.toFixed(2)),
        position: position || null,
        teacherRemarks: teacherRemarks || "",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my children's results (parent)
export const getMyChildrenResults = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.childrenIds || user.childrenIds.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const results = await Result.find({
      childId: { $in: user.childrenIds },
    })
      .populate("childId", "name grade studentNumber")
      .sort({ year: -1, term: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get results for a specific child (admin or parent)
export const getResultsByChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) {
      return res
        .status(404)
        .json({ success: false, message: "Child not found" });
    }

    if (
      req.user.role !== "admin" &&
      !child.parents.some((p) => p.toString() === req.user.id)
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });
    }

    const results = await Result.find({ childId: req.params.childId }).sort({
      year: -1,
      term: -1,
    });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};