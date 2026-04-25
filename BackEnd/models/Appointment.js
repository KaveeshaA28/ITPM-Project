import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    availabilitySlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Availability",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    day: {
      type: String,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "completed", "cancelled"],
      default: "pending",
    },

    message: {
      type: String, // purpose of meeting
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },

    cancelReason: {
      type: String,
      default: null,
    },
    cancelHistory: [
  {
    cancelledBy: String,
    reason: String,
    date: {
      type: Date,
      default: Date.now
    }
  }
],
  },
  { timestamps: true },
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
