import Appointment from "../models/Appointment.js";
import Availability from "../models/Availability.js";
import { sendEmail } from "../utils/sendEmail.js";

/* ===============================
Book Appointment (Student)
================================= */

export const bookAppointment = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can book appointments" });
    }

    const { slotId, message } = req.body;

    const slot = await Availability.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.isBooked || slot.isBlocked) {
      //Conflict Prevention Logic/This line prevents double booking.
      return res
        .status(400)
        .json({ message: "Slot already booked or blocked" });
    }

    // Create appointment
    const appointment = await Appointment.create({
      student: req.user.id,
      lecturer: slot.lecturer,
      availabilitySlot: slot._id,
      date: slot.date,
      day: slot.day,
      startTime: slot.startTime,
      message,
    });

    // Mark slot as booked
    slot.isBooked = true;
    await slot.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Booking failed",
      error: error.message,
    });
  }
};

/* ===============================
Get Student Appointments (History)
================================= */

export const getStudentAppointments = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can view their appointments" });
    }

    const appointments = await Appointment.find({
      student: req.user.id,
    })
      .populate("lecturer", "firstname lastname email")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching appointments",
      error: error.message,
    });
  }
};

/* ===============================
Approve Appointment
================================= */

export const approveAppointment = async (req, res) => {
  try {
    if (req.user.role !== "lecturer") {
      return res
        .status(403)
        .json({ message: "Only lecturers can approve appointments" });
    }

    const appointment = await Appointment.findById(req.params.id).populate(
      "student",
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "approved") {
      return res.status(400).json({
        message: "Appointment already approved",
      });
    }

    // 🔐 SECURITY CHECK
    if (appointment.lecturer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only approve your own appointments" });
    }

    appointment.status = "approved";
    await appointment.save();

    //Email Sending Function

    await sendEmail(
      appointment.student.email,
      "Appointment Approved",
      `Your appointment on ${appointment.day} at ${appointment.startTime} has been approved.`,
    );

    res.json({ message: "Appointment approved and email sent" });
  } catch (error) {
    res.status(500).json({
      message: "Error approving appointment",
      error: error.message,
    });
  }
};
/* ===============================
Cancel Appointment
================================= */
export const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body; // reason given by lecturer
    const appointment = await Appointment.findById(req.params.id).populate("student");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only the lecturer who owns the appointment can cancel
    if (appointment.lecturer.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only cancel your own appointments" });
    }

    // Only allow cancelling pending or approved appointments
    if (!["pending", "approved"].includes(appointment.status)) {
      return res.status(400).json({ message: "Cannot cancel completed or already cancelled appointments" });
    }

    // Must provide a reason
    if (!reason || reason.trim() === "") {
      return res.status(400).json({ message: "Cancellation reason is required" });
    }

    // Update appointment
    appointment.status = "cancelled";
    appointment.cancelReason = reason;

    // Update cancel history
    appointment.cancelHistory = appointment.cancelHistory || [];
    appointment.cancelHistory.push({
      cancelledBy: "lecturer",
      reason: reason,
      date: new Date(),
    });

    await appointment.save();

    // Free the slot
    const slot = await Availability.findById(appointment.availabilitySlot);
    if (slot) {
      slot.isBooked = false;
      await slot.save();
    }

    // Notify student
    await sendEmail(
      appointment.student.email,
      "Appointment Cancelled",
      `Your appointment on ${appointment.day} at ${appointment.startTime} has been cancelled by your lecturer.\n\nReason:\n${reason}\n\nYou can reschedule here: http://localhost:5173/book-appointment`
    );

    res.json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error cancelling appointment" });
  }
};

// Completed Appointment

export const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "student",
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // 🔐 SECURITY CHECK
    if (appointment.lecturer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only complete your own appointments" });
    }

    // Check if already cancelled
    if (appointment.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "Cancelled appointment cannot be completed" });
    }

    // Update status
    appointment.status = "completed";
    await appointment.save();

    // Send Completion Email to Student
    await sendEmail(
      appointment.student.email,
      "Appointment Completed",
      `Your appointment on ${appointment.day} at ${appointment.startTime} has been marked as completed.`,
    );

    res.json({ message: "Appointment completed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error completing appointment" });
  }
};

//Take lecture Appointments


export const getLecturerAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ lecturer: req.user.id })
      .populate("student", "firstname lastname email")
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};