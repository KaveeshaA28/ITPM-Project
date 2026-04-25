import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LecturerDashboard from "./pages/LectureDashboard";
import StudentDashboard from "./pages/studentDashboard";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";
import Home from "./pages/Home";
import BookAppointment from "./pages/BookAppointment";
import StudentHistory from "./pages/StudentHistory";
import StudentProgress from "./pages/StudentProgress";
import Feedback from "./pages/Feedback";
import FeedbackHistory from "./pages/FeedbackHistory";
import LectureProgress from "./pages/LectureProgress";
import LecturerFeedback from "./pages/LecturerFeedback";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* Lecturer */}
      <Route
        path="/lecturer"
        element={
          <PrivateRoute role="lecturer">
            <LecturerDashboard />
          </PrivateRoute>
        }
      />

      {/* Student */}
      <Route
        path="/student"
        element={
          <PrivateRoute role="student">
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      <Route path="/book-appointment" element={<BookAppointment />} />
      <Route path="/student-history" element={<StudentHistory />} />
      <Route path="/student-progress" element={<StudentProgress />} />
      <Route path="/feedback/:id" element={<Feedback />} />
      <Route path="/feedback-history" element={<FeedbackHistory />} />
      <Route path="/lecture-progress" element={<LectureProgress />} />
      <Route path="/lecturer-feedback" element={<LecturerFeedback />} />

      {/* Catch-all → Home */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
