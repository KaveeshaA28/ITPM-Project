import express from "express";
import { createAvailability , getLecturerAvailability} from "../Controllers/availabilityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createAvailability);
router.get("/lecturer/:lecturerId", protect, getLecturerAvailability);


export default router;
