import Feedback from "../models/Feedback.js";
import Appointment from "../models/Appointment.js";

export const submitFeedback = async (req, res) => {
  try {

    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can submit feedback" });
    }

    const { rating, comment } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only review your own appointments" });
    }

    if (appointment.status !== "completed") {
      return res.status(400).json({ message: "Feedback allowed only after completion" });
    }

    // Prevent duplicate feedback
    const existing = await Feedback.findOne({
      appointment: appointment._id
    });

    if (existing) {
      return res.status(400).json({ message: "Feedback already submitted" });
    }

    const newFeedback = await Feedback.create({
      appointment: appointment._id,
      student: req.user.id,
      lecturer: appointment.lecturer,
      rating,
      comment
    });

    res.json({
      message: "Feedback submitted successfully",
      feedback: newFeedback
    });

  } catch (error) {
    res.status(500).json({
      message: "Error submitting feedback",
      error: error.message
    });
  }
};

export const getLecturerFeedback = async (req, res) => {
  try {

    const lecturerId = req.params.lecturerId;

    const feedbacks = await Feedback.find({
      lecturer: lecturerId
    }).populate("student", "firstname lastname");

    if (feedbacks.length === 0) {
      return res.json({
        averageRating: 0,
        totalReviews: 0,
        feedbacks: []
      });
    }

    const totalRating = feedbacks.reduce((sum, item) => sum + item.rating, 0);

    const averageRating = (totalRating / feedbacks.length).toFixed(1);

    res.json({
      averageRating,
      totalReviews: feedbacks.length,
      feedbacks
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching lecturer feedback",
      error: error.message
    });
  }
};