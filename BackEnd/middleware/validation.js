// export const validateFeedback = (req, res, next) => {
//   const { appointment, rating, comment } = req.body;

//   if (!appointment) {
//     return res.status(400).json({ message: "Appointment ID is required" });
//   }

//   if (!rating || rating < 1 || rating > 5) {
//     return res.status(400).json({
//       message: "Rating must be between 1 and 5",
//     });
//   }

//   if (comment && comment.length > 300) {
//     return res.status(400).json({
//       message: "Comment too long (max 300 characters)",
//     });
//   }

//   next();
// };