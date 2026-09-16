import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import childRoutes from "./routes/childRoutes.js";
import feeRoutes from "./routes/feeRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// ========== TRUST PROXY ==========
// Required when behind ngrok/proxy so rate-limit works correctly
app.set("trust proxy", 1);

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(cors());

// ========== RATE LIMITING ==========
// Limit payment requests to prevent spam
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: "Too many payment attempts. Please try again later.",
  },
});

// Apply rate limiting to payment routes
app.use("/api/payments", paymentLimiter);

// ========== ROUTES ==========
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/children", childRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin", adminRoutes);

// ========== TEST ROUTE ==========
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;