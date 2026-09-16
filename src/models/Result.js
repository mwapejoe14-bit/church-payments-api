import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    grade: { type: String }, // computed letter grade (A, B, C, etc.)
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      required: true,
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
    subjects: [subjectSchema],
    average: {
      type: Number,
      min: 0,
      max: 100,
    },
    position: {
      type: Number,
    },
    teacherRemarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

resultSchema.index({ childId: 1, term: 1, year: 1 }, { unique: true });

const Result = mongoose.model("Result", resultSchema);
export default Result;