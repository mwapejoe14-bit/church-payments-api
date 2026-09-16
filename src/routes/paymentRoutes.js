import express from "express";
import {
  makePayment,
  makeBatchPayment,
  getMyPayments,
  getAllPayments,
  getBatch,
} from "../controllers/paymentController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validatePayment } from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", validatePayment, makePayment);
router.post("/batch", makeBatchPayment);
router.get("/my-payments", getMyPayments);
router.get("/admin/all", adminOnly, getAllPayments);
router.get("/batch/:batchId", getBatch);

export default router;