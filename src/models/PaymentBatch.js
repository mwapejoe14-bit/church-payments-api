import mongoose from "mongoose";

const paymentBatchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Child",
      required: true,
    },
    batchId: {
      type: String,
      required: true,
      unique: true,
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
    transactionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "partial", "success", "failed"],
      default: "pending",
    },
    provider: {
      type: String,
      enum: ["MTN", "Airtel", "Zamtel"],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const PaymentBatch = mongoose.model("PaymentBatch", paymentBatchSchema);
export default PaymentBatch;