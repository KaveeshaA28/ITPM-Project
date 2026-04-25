import cron from "node-cron";
import Appointment from "../models/Appointment.js";
import { sendEmail } from "./sendEmail.js";

cron.schedule("* * * * *", async () => {
  console.log("Checking for upcoming appointments...");

  const now = new Date();

  const upcoming = await Appointment.find({
    status: "approved",
    reminderSent: false,
  }).populate("student");

  for (let appointment of upcoming) {

    const appointmentDateTime = new Date(appointment.date);

    const [hours, minutes] = appointment.startTime.split(":");

    appointmentDateTime.setHours(parseInt(hours));
    appointmentDateTime.setMinutes(parseInt(minutes));
    appointmentDateTime.setSeconds(0);
    appointmentDateTime.setMilliseconds(0);

    const diff = appointmentDateTime - now;

    if (diff > 0 && diff <= 60 * 60000) {

      console.log("Reminder triggered for:", appointment.student.email);

      await sendEmail(
        appointment.student.email,
        "Appointment Reminder",
        `Reminder: You have an appointment today at ${appointment.startTime}`
      );

      appointment.reminderSent = true;
      await appointment.save();
    }
  }
});