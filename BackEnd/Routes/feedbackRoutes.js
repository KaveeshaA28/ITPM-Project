import express from "express";
import { submitFeedback , getLecturerFeedback} from "../Controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/submit/:id",protect , submitFeedback);
router.get("/lecturer/:lecturerId", getLecturerFeedback);

export default router;