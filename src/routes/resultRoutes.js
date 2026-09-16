import express from "express";
import {
  upsertResult,
  getMyChildrenResults,
  getResultsByChild,
} from "../controllers/resultController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/my", getMyChildrenResults);
router.post("/", adminOnly, upsertResult);
router.get("/child/:childId", getResultsByChild);

export default router;