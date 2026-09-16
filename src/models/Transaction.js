import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least 1"],
    },
    // Extended type — church + PTA fee types
    type: {
      type: String,
      enum: [
        "tithe",
        "offering",
        "special",
        "school",
        "uniform",
        "lunch",
        "bus",
      ],
      required: true,
    },
    // For church vs pta routing
    category: {
      type: String,
      enum: ["church", "pta"],
      required: true,
    },
    // For PTA transactions
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      default: null,
    },
    batchId: {
      type: String,
      default: null,
    },
    term: {
      type: String,
      enum: ["term1", "term2", "term3", null],
      default: null,
    },
    year: {
      type: Number,
      default: null,
    },
    provider: {
      type: String,
      enum: ["MTN", "Airtel", "Zamtel"],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;