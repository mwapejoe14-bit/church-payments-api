import mongoose from "mongoose";

const childSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Child name is required"],
      trim: true,
    },
    studentNumber: {
      type: String,
      required: [true, "Student number is required"],
      unique: true,
      trim: true,
    },
    grade: {
      type: Number,
      required: [true, "Grade is required"],
      min: 1,
      max: 12,
    },
    parents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Child = mongoose.model("Child", childSchema);
export default Child;