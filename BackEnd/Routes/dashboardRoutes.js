import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getLecturerDashboard } from "../Controllers/dashboardController.js";

const router = express.Router();

router.get("/lecturer", protect, getLecturerDashboard);

export default router;