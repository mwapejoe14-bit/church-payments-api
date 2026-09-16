import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Child from "../models/Child.js";
import PaymentBatch from "../models/PaymentBatch.js";

const generateTransactionId = () => "TXN" + Date.now() + Math.floor(Math.random() * 1000);
const generateBatchId = () => "BATCH" + Date.now() + Math.floor(Math.random() * 1000);

const simulateMobileMoneyPayment = (provider, amount) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isSuccess = Math.random() < 0.9;
      if (isSuccess) {
        resolve({ status: "success", message: `Payment of K${amount} via ${provider} successful` });
      } else {
        resolve({ status: "failed", message: `Payment failed. Please try again.` });
      }
    }, 1500);
  });
};

const CHURCH_TYPES = ["tithe", "offering", "special"];
const PTA_TYPES = ["school", "uniform", "lunch", "bus"];

export const makePayment = async (req, res) => {
  try {
    const { amount, type, provider, phoneNumber, childId, term, year } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const allTypes = [...CHURCH_TYPES, ...PTA_TYPES];
    if (!allTypes.includes(type)) {
      return res.status(400).json({ success: false, message: `Invalid type. Use: ${allTypes.join(", ")}` });
    }

    if (!["MTN", "Airtel", "Zamtel"].includes(provider)) {
      return res.status(400).json({ success: false, message: "Invalid provider" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const category = CHURCH_TYPES.includes(type) ? "church" : "pta";

    if (category === "pta") {
      if (!childId) return res.status(400).json({ success: false, message: "childId required for PTA" });
      const child = await Child.findById(childId);
      if (!child) return res.status(404).json({ success: false, message: "Child not found" });
      if (user.role !== "admin" && !child.parents.some((p) => p.toString() === userId)) {
        return res.status(403).json({ success: false, message: "Not linked to this child" });
      }
    }

    const transactionId = generateTransactionId();
    const transaction = await Transaction.create({
      userId, amount, type, category,
      childId: childId || null,
      term: term || null,
      year: year || null,
      provider, phoneNumber, transactionId,
      status: "pending",
    });

    const paymentResult = await simulateMobileMoneyPayment(provider, amount);
    transaction.status = paymentResult.status;
    await transaction.save();

    if (!user.preferredProvider) {
      user.preferredProvider = provider;
      await user.save();
    }

    if (paymentResult.status === "success") {
      return res.status(200).json({ success: true, message: paymentResult.message, data: transaction });
    } else {
      return res.status(400).json({
        success: false, message: paymentResult.message,
        data: { transactionId: transaction.transactionId, status: transaction.status },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const makeBatchPayment = async (req, res) => {
  try {
    const { childId, term, year, provider, phoneNumber, items } = req.body;
    const userId = req.user.id;

    if (!childId || !term || !year || !provider || !phoneNumber) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "items[] is required" });
    }

    for (const item of items) {
      if (!PTA_TYPES.includes(item.type) || !item.amount || item.amount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid item" });
      }
    }

    const user = await User.findById(userId);
    const child = await Child.findById(childId);
    if (!child) return res.status(404).json({ success: false, message: "Child not found" });
    if (user.role !== "admin" && !child.parents.some((p) => p.toString() === userId)) {
      return res.status(403).json({ success: false, message: "Not linked to this child" });
    }

    const batchId = generateBatchId();
    const totalAmount = items.reduce((sum, i) => sum + Number(i.amount), 0);

    const batch = await PaymentBatch.create({
      userId, childId, batchId, term, year, provider, phoneNumber,
      totalAmount, status: "pending", transactionIds: [],
    });

    const transactions = [];
    for (const item of items) {
      const transactionId = generateTransactionId();
      const tx = await Transaction.create({
        userId, amount: item.amount, type: item.type, category: "pta",
        childId, batchId, term, year, provider, phoneNumber,
        transactionId, status: "pending",
      });
      transactions.push(tx);
    }

    let successCount = 0;
    for (const tx of transactions) {
      const result = await simulateMobileMoneyPayment(provider, tx.amount);
      tx.status = result.status;
      await tx.save();
      if (result.status === "success") successCount++;
    }

    let batchStatus = "failed";
    if (successCount === transactions.length) batchStatus = "success";
    else if (successCount > 0) batchStatus = "partial";

    batch.status = batchStatus;
    batch.transactionIds = transactions.map((t) => t._id);
    await batch.save();

    if (!user.preferredProvider) {
      user.preferredProvider = provider;
      await user.save();
    }

    if (batchStatus === "success") {
      return res.status(200).json({
        success: true,
        message: `All ${transactions.length} payments successful. Total: K${totalAmount}`,
        data: { batch, transactions },
      });
    } else if (batchStatus === "partial") {
      return res.status(200).json({
        success: true,
        message: `${successCount}/${transactions.length} payments succeeded`,
        data: { batch, transactions },
      });
    } else {
      return res.status(400).json({ success: false, message: "All payments failed", data: { batch, transactions } });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate("childId", "name grade")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }
    const transactions = await Transaction.find({})
      .populate("userId", "name email phone")
      .populate("childId", "name grade")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBatch = async (req, res) => {
  try {
    const batch = await PaymentBatch.findOne({ batchId: req.params.batchId }).populate("transactionIds");
    if (!batch) return res.status(404).json({ success: false, message: "Batch not found" });
    res.status(200).json({ success: true, data: batch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
