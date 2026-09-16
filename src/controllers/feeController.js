import FeeStructure from "../models/FeeStructure.js";

// @desc    Create/update fee structure for a grade+term+year (admin)
export const upsertFeeStructure = async (req, res) => {
  try {
    const { grade, term, year, fees } = req.body;

    if (!grade || !term || !year || !Array.isArray(fees)) {
      return res.status(400).json({
        success: false,
        message: "grade, term, year, and fees[] are required",
      });
    }

    const structure = await FeeStructure.findOneAndUpdate(
      { grade, term, year },
      { grade, term, year, fees, active: true },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all fee structures (admin)
export const getFeeStructures = async (req, res) => {
  try {
    const { year, term } = req.query;
    const filter = {};
    if (year) filter.year = Number(year);
    if (term) filter.term = term;

    const structures = await FeeStructure.find(filter).sort({
      grade: 1,
      year: -1,
    });
    res.status(200).json({
      success: true,
      count: structures.length,
      data: structures,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get fee structure for a specific grade+term+year (public/auth)
export const getFeesForGrade = async (req, res) => {
  try {
    const { grade, term, year } = req.query;

    if (!grade || !term || !year) {
      return res.status(400).json({
        success: false,
        message: "grade, term, and year are required",
      });
    }

    const structure = await FeeStructure.findOne({
      grade: Number(grade),
      term,
      year: Number(year),
      active: true,
    });

    if (!structure) {
      return res.status(404).json({
        success: false,
        message: "No fee structure found for this grade/term/year",
      });
    }

    res.status(200).json({ success: true, data: structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};