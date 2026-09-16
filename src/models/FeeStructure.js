import mongoose from "mongoose";

const feeItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["school", "uniform", "lunch", "bus"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const feeStructureSchema = new mongoose.Schema(
  {
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    term: {
      type: String,
      enum: ["term1", "term2", "term3"],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    fees: [feeItemSchema],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// One fee structure per grade+term+year
feeStructureSchema.index({ grade: 1, term: 1, year: 1 }, { unique: true });

const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);
export default FeeStructure;