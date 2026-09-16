import express from "express";
import {
  createChild,
  getAllChildren,
  getMyChildren,
  getChild,
} from "../controllers/childController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/my", getMyChildren);
router.post("/", adminOnly, createChild);
router.get("/", adminOnly, getAllChildren);
router.get("/:id", getChild);

export default router;