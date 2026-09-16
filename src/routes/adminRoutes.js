import express from "express";
import {
  getPendingUsers,
  approveUser,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/pending-users", getPendingUsers);
router.post("/approve/:userId", approveUser);

export default router;