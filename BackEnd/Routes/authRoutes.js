import express from "express";
import { registerUser, loginUser, createLecturer , getUserDetails , updateUserProfile ,getAllLecturers } from "../Controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/create-lecturer", protect, isAdmin, createLecturer);
router.get("/user/profile", protect, getUserDetails);
router.put("/user/profile", protect, updateUserProfile);
router.get("/lecturers", getAllLecturers);
// router.get("/counts", getSystemCounts);


export default router;