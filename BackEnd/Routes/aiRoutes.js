import express from "express";
import { getRecommendedSlot ,recommendLecturer } from "../Controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/recommend/:lecturerId", protect, getRecommendedSlot);
router.get("/best/recommend", protect, recommendLecturer);


export default router;
