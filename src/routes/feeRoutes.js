import express from "express";
import {
  upsertFeeStructure,
  getFeeStructures,
  getFeesForGrade,
} from "../controllers/feeController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/for-grade", getFeesForGrade);
router.get("/", adminOnly, getFeeStructures);
router.post("/", adminOnly, upsertFeeStructure);

export default router;