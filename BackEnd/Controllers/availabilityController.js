import Availability from "../models/Availability.js";

/* ===============================
   Create Availability Slots
================================= */

export const createAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime, slotDuration } = req.body;

    if (req.user.role !== "lecturer") {
      return res.status(403).json({ message: "Only lecturers can create availability" });
    }

    const slots = [];

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    let current = start;

    while (current < end) {
      let next = new Date(current.getTime() + slotDuration * 60000);

      slots.push({
        lecturer: req.user.id,
        date,
        day: new Date(date).toLocaleDateString("en-US", { weekday: "long" }),
        startTime: current.toTimeString().slice(0, 5),
        endTime: next.toTimeString().slice(0, 5),
      });

      current = next;
    }

    await Availability.insertMany(slots);

    res.status(201).json({
      message: "Availability slots created successfully",
      totalSlots: slots.length,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create availability",
      error: error.message,
    });
  }
};

// Create GET API to View Slots

export const getLecturerAvailability = async (req, res) => {
  try {
    console.log("User:", req.user);
    console.log("Lecturer Param:", req.params.lecturerId);

    const lecturerId = req.params.lecturerId.trim();

    // ✅ Get today's date (start of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await Availability.find({
      lecturer: lecturerId,
      isBooked: false,
      isBlocked: false,

      // ✅ Only today or future dates
      date: { $gte: today }
    }).sort({ date: 1 }); // optional: sort by date

    res.json(slots);

  } catch (error) {
    console.error("Availability Error:", error);
    res.status(500).json({
      message: "Error fetching availability",
      error: error.message
    });
  }
};
