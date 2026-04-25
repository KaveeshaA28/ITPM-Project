import dotenv from "dotenv";
dotenv.config(); // MUST BE FIRST

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./Routes/authRoutes.js";
import verifyToken from "./middleware/verifyToken.js";
import availabilityRoutes from "./Routes/availabilityRoutes.js";
import appointmentRoutes from "./Routes/appointmentRoutes.js";
import aiRoutes from "./Routes/aiRoutes.js";
import "./utils/reminderCron.js";
import feedbackRoutes from "./Routes/feedbackRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import dashboardRoutes from "./Routes/dashboardRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());


mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("MongoDB Connected");
});

app.use("/api/auth", authRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/test", verifyToken, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user,
  });
});

app.use(errorHandler);

app.listen(7000, () => {
  console.log("Server running on port 7000");
});
