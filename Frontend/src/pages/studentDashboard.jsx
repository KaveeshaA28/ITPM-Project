import { useEffect, useState } from "react";
import React from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const StudentDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [student, setStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonText, setReasonText] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [formData, setFormData] = useState({
    firstname: "", lastname: "", email: "", department: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appointmentRes, studentRes] = await Promise.all([
          API.get("/appointments/student"),
          API.get("/auth/user/profile"),
        ]);
        setAppointments(appointmentRes.data);
        setStudent(studentRes.data.user);
        setFormData({
          firstname: studentRes.data.user.firstname || "",
          lastname: studentRes.data.user.lastname || "",
          email: studentRes.data.user.email || "",
          department: studentRes.data.user.department || "",
        });
      } catch (error) {
        console.error("Error loading dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const viewReason = (reason) => { setReasonText(reason); setShowReasonModal(true); };
  const refreshAppointments = async () => {
    try { const res = await API.get("/appointments/student"); setAppointments(res.data); } catch (e) { console.error(e); }
  };

  const validate = (data) => {
    const errors = {};
    if (!data.firstname.trim()) errors.firstname = "First name is required.";
    else if (!/^[A-Za-z\s'-]{2,50}$/.test(data.firstname.trim())) errors.firstname = "First name must be 2–50 letters only.";
    if (!data.lastname.trim()) errors.lastname = "Last name is required.";
    else if (!/^[A-Za-z\s'-]{2,50}$/.test(data.lastname.trim())) errors.lastname = "Last name must be 2–50 letters only.";
    if (!data.email.trim()) errors.email = "Email is required.";
    else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(data.email.trim())) errors.email = "Only @gmail.com addresses are allowed.";
    if (!data.department.trim()) errors.department = "Department is required.";
    else if (data.department.trim().length < 2) errors.department = "Department must be at least 2 characters.";
    return errors;
  };

  const handleFieldChange = (key, value) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    if (formTouched[key]) {
      const errors = validate(updated);
      setFormErrors((prev) => ({ ...prev, [key]: errors[key] || "" }));
    }
  };

  const handleFieldBlur = (key) => {
    setFormTouched((prev) => ({ ...prev, [key]: true }));
    const errors = validate(formData);
    setFormErrors((prev) => ({ ...prev, [key]: errors[key] || "" }));
  };

  const openEditModal = () => { setFormErrors({}); setFormTouched({}); setSaveError(""); setShowEditModal(true); };

  const saveProfile = async () => {
    setFormTouched({ firstname: true, lastname: true, email: true, department: true });
    const errors = validate(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaveError("");
    try {
      const res = await API.put("/auth/user/profile", formData);
      setStudent(res.data.user);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating profile", error);
      setSaveError("Failed to update profile. Please try again.");
    }
  };

  const statusConfig = {
    approved:  { bg: "#DBEAFE", border: "#BFDBFE", color: "#1D4ED8", dot: "#3B82F6", label: "Approved"  },
    completed: { bg: "#D1FAE5", border: "#A7F3D0", color: "#065F46", dot: "#10B981", label: "Completed" },
    cancelled: { bg: "#FEE2E2", border: "#FECACA", color: "#991B1B", dot: "#EF4444", label: "Cancelled" },
    pending:   { bg: "#FEF3C7", border: "#FDE68A", color: "#92400E", dot: "#F59E0B", label: "Pending"   },
  };

  const stats = [
    { label: "Total",     value: appointments.length,                                           icon: "📋", color: "#EFF6FF", border: "#BFDBFE" },
    { label: "Approved",  value: appointments.filter(a => a.status === "approved").length,      icon: "✅", color: "#EFF6FF", border: "#BFDBFE" },
    { label: "Completed", value: appointments.filter(a => a.status === "completed").length,     icon: "🎓", color: "#F0FDF4", border: "#BBF7D0" },
    { label: "Cancelled", value: appointments.filter(a => a.status === "cancelled").length,     icon: "❌", color: "#FFF1F2", border: "#FECDD3" },
  ];

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const filtered = activeTab === "all" ? appointments : appointments.filter(a => a.status === activeTab);

  if (loading) {
    return (
      <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F8F7F4", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#888" }}>
          <svg style={{ animation: "spin 0.8s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#E8E6E0" strokeWidth="3"/>
            <path d="M12 2a10 10 0 0110 10" stroke="#7c6af7" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          Loading dashboard…
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F8F7F4", minHeight: "100vh", color: "#1a1a2e" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes errIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        /* Nav */
        .sd-nav-btn {
          padding: 9px 18px; border-radius: 10px; border: 1.5px solid #E8E6E0;
          background: white; color: #555; font-family: 'DM Sans',sans-serif;
          font-weight: 500; font-size: 0.84rem; cursor: pointer;
          transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px;
        }
        .sd-nav-btn:hover { border-color: #1a1a2e; color: #1a1a2e; }
        .sd-nav-btn-primary {
          padding: 9px 18px; border-radius: 10px; border: none;
          background: #1a1a2e; color: white; font-family: 'DM Sans',sans-serif;
          font-weight: 600; font-size: 0.84rem; cursor: pointer;
          transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px;
          box-shadow: 0 2px 8px rgba(26,26,46,0.25);
        }
        .sd-nav-btn-primary:hover { background: #2d2d4e; transform: translateY(-1px); }

        /* Section cards */
        .section-card {
          background: white; border: 1.5px solid #E8E6E0;
          border-radius: 16px; padding: 24px;
          transition: border-color 0.2s;
        }

        /* Stats */
        .stat-card {
          background: white; border: 1.5px solid #E8E6E0; border-radius: 14px;
          padding: 20px 22px; flex: 1; min-width: 130px;
          transition: all 0.2s ease; text-align: center; cursor: default;
        }
        .stat-card:hover { border-color: #c4bff5; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.06); }

        /* Appointment cards */
        .appt-card {
          background: white; border: 1.5px solid #E8E6E0; border-radius: 14px;
          padding: 18px 22px; transition: all 0.2s ease;
          position: relative; overflow: hidden;
        }
        .appt-card::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 3px; background: linear-gradient(180deg, #7c6af7, #a78bfa);
          border-radius: 99px 0 0 99px; opacity: 0; transition: opacity 0.2s;
        }
        .appt-card:hover { border-color: #c4bff5; box-shadow: 0 6px 24px rgba(0,0,0,0.07); }
        .appt-card:hover::before { opacity: 1; }

        /* Tabs */
        .tab-btn {
          font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500;
          padding: 8px 16px; border: none; background: none; cursor: pointer;
          color: #888; border-bottom: 2px solid transparent;
          transition: all 0.15s; white-space: nowrap;
        }
        .tab-btn:hover { color: #1a1a2e; }
        .tab-btn.active { color: #7c6af7; border-bottom-color: #7c6af7; font-weight: 600; }

        /* Status pill */
        .status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 99px;
          font-size: 0.75rem; font-weight: 600; border: 1px solid;
        }

        /* Buttons */
        .btn-view-reason {
          font-size: 0.78rem; font-weight: 600; padding: 6px 12px; border-radius: 8px;
          cursor: pointer; border: 1px solid #FECACA; background: #FEF2F2; color: #DC2626;
          font-family: 'DM Sans',sans-serif; transition: all 0.15s;
        }
        .btn-view-reason:hover { background: #FEE2E2; }

        .btn-feedback {
          font-size: 0.78rem; font-weight: 600; padding: 6px 12px; border-radius: 8px;
          cursor: pointer; border: 1px solid #FDE68A; background: #FFFBEB; color: #B45309;
          font-family: 'DM Sans',sans-serif; transition: all 0.15s;
        }
        .btn-feedback:hover { background: #FEF3C7; }

        /* Avatar */
        .sd-avatar {
          width: 68px; height: 68px; border-radius: 50%;
          background: linear-gradient(135deg, #7c6af7, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif; font-weight: 900; font-size: 1.5rem;
          color: white; flex-shrink: 0; box-shadow: 0 6px 20px rgba(124,106,247,0.3);
        }

        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.35);
          backdrop-filter: blur(6px); display: flex;
          align-items: center; justify-content: center; z-index: 100; padding: 20px;
        }
        .modal-box {
          background: white; border: 1.5px solid #E8E6E0;
          border-radius: 20px; padding: 32px; width: 100%; max-width: 420px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.15);
        }
        .modal-input {
          width: 100%; padding: 11px 14px; border-radius: 11px;
          border: 1.5px solid #E8E6E0; outline: none; color: #1a1a2e;
          font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
          transition: all 0.2s ease; background: white;
        }
        .modal-input::placeholder { color: #bbb; }
        .modal-input:focus { border-color: #7c6af7; box-shadow: 0 0 0 3px rgba(124,106,247,0.1); }
        .modal-input.input-error { border-color: #FECACA !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.08) !important; }

        .modal-label { font-size: 0.8rem; font-weight: 600; color: #555; margin-bottom: 5px; display: block; }
        .field-error { display: flex; align-items: center; gap: 5px; font-size: 0.75rem; color: #DC2626; margin-top: 5px; animation: errIn 0.18s ease; }

        .btn-modal-save {
          background: #1a1a2e; color: white; font-weight: 600; border: none; cursor: pointer;
          border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
          padding: 11px 22px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 7px;
        }
        .btn-modal-save:hover { background: #2d2d4e; }
        .btn-modal-cancel {
          background: white; color: #555; border: 1.5px solid #E8E6E0; cursor: pointer;
          border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
          padding: 11px 22px; transition: all 0.15s;
        }
        .btn-modal-cancel:hover { border-color: #1a1a2e; color: #1a1a2e; }

        /* Empty state */
        .empty-state { text-align: center; padding: 48px 24px; }
        .empty-icon { font-size: 3rem; margin-bottom: 14px; }
        .empty-title { font-family: 'Fraunces', serif; font-weight: 700; font-size: 1.1rem; color: #1a1a2e; margin-bottom: 6px; }
        .empty-sub { font-size: 0.875rem; color: #888; margin-bottom: 20px; }
        .btn-book-empty {
          background: #1a1a2e; color: white; font-weight: 600; border: none; cursor: pointer;
          border-radius: 11px; font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
          padding: 12px 24px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 14px rgba(26,26,46,0.25);
        }
        .btn-book-empty:hover { background: #2d2d4e; transform: translateY(-1px); }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{ background: "white", borderBottom: "1px solid #E8E6E0", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="2.5" fill="white" fillOpacity="0.7"/>
              </svg>
            </div>
            <span style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>AcadPortal</span>
            <span style={{ color: "#E8E6E0", margin: "0 4px" }}>·</span>
            <span style={{ fontSize: "0.8rem", color: "#888", fontWeight: 500 }}>Student Dashboard</span>
          </div>
          {/* Nav actions */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="sd-nav-btn" onClick={refreshAppointments}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Refresh
            </button>
            <button className="sd-nav-btn" onClick={() => navigate("/student-history")}>📜 History</button>
            <button className="sd-nav-btn" onClick={() => navigate("/feedback-history")}>💬 Feedback</button>
            <button className="sd-nav-btn-primary" onClick={() => navigate("/book-appointment")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Book Appointment
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Page heading ── */}
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.15em", color: "#7c6af7", textTransform: "uppercase", marginBottom: 4 }}>Student Portal</p>
          <h1 style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "2rem", color: "#1a1a2e", letterSpacing: "-0.03em", marginBottom: 4 }}>My Dashboard</h1>
          <p style={{ fontSize: "0.9rem", color: "#888", lineHeight: 1.6 }}>Manage your appointments, profile, and academic progress.</p>
        </div>

        {/* ── Profile card ── */}
        <div className="section-card">
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div className="sd-avatar">
              {student?.profilePicture
                ? <img src={student.profilePicture} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                : <span>{student?.firstname?.[0] ?? "?"}</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "1.25rem", color: "#1a1a2e", marginBottom: 10 }}>
                {student?.firstname} {student?.lastname}
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
                {[["Email", student?.email], ["Role", student?.role], ["Department", student?.department]].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: "0.68rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: "0.88rem", color: "#333", fontWeight: 500 }}>{value || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="sd-nav-btn" onClick={openEditModal} style={{ flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Edit Profile
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {stats.map(({ label, value, icon, color, border }) => (
            <div key={label} className="stat-card" style={{ background: color, borderColor: border }}>
              <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "1.8rem", color: "#1a1a2e", letterSpacing: "-0.03em" }}>{value}</div>
              <div style={{ fontSize: "0.75rem", color: "#777", marginTop: 2, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Appointments section ── */}
        <div className="section-card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📅</div>
              <div>
                <div style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>My Appointments</div>
                <div style={{ fontSize: "0.75rem", color: "#888", marginTop: 1 }}>{appointments.length} total bookings</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, padding: "0 24px", borderBottom: "1px solid #E8E6E0", marginTop: 16, overflowX: "auto" }}>
            {tabs.map(({ key, label }) => (
              <button key={key} className={`tab-btn ${activeTab === key ? "active" : ""}`} onClick={() => setActiveTab(key)}>
                {label}
                {key !== "all" && (
                  <span style={{ marginLeft: 5, fontSize: "0.7rem", background: activeTab === key ? "#EDE9FE" : "#F3F4F6", color: activeTab === key ? "#7c3aed" : "#888", padding: "1px 6px", borderRadius: 99, fontWeight: 600 }}>
                    {appointments.filter(a => key === "all" || a.status === key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🗓️</div>
                <div className="empty-title">No appointments {activeTab !== "all" ? `with status "${activeTab}"` : "yet"}</div>
                <div className="empty-sub">
                  {activeTab === "all" ? "Book your first session with a lecturer!" : "Try a different filter above."}
                </div>
                {activeTab === "all" && (
                  <button className="btn-book-empty" onClick={() => navigate("/book-appointment")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                    Book Appointment
                  </button>
                )}
              </div>
            ) : (
              filtered.map((appt) => {
                const sc = statusConfig[appt.status] || statusConfig.pending;
                return (
                  <div key={appt._id} className="appt-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                      {/* Left */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 11, background: "#F5F3FF", border: "1px solid #DDD6FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎓</div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "0.95rem" }}>
                            {appt.lecturer ? `${appt.lecturer.firstname} ${appt.lecturer.lastname}` : "Not assigned"}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#999", marginTop: 2 }}>Lecturer</div>
                        </div>
                      </div>

                      {/* Middle: date & time */}
                      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: "0.68rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Date</div>
                          <div style={{ fontSize: "0.85rem", color: "#333", fontWeight: 500 }}>
                            {appt.date ? new Date(appt.date).toDateString() : "—"}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "0.68rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Time</div>
                          <div style={{ fontSize: "0.85rem", color: "#333", fontWeight: 500, fontFamily: "monospace" }}>{appt.startTime || "—"}</div>
                        </div>
                      </div>

                      {/* Right: status + actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className="status-pill" style={{ background: sc.bg, borderColor: sc.border, color: sc.color }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                          {sc.label}
                        </span>
                        {appt.status === "cancelled" && appt.cancelReason && (
                          <button className="btn-view-reason" onClick={() => viewReason(appt.cancelReason)}>View Reason</button>
                        )}
                        {appt.status === "completed" && !appt.isFeedbackSubmitted && (
                          <button className="btn-feedback" onClick={() => navigate(`/feedback/${appt._id}`)}>⭐ Feedback</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ paddingBottom: 8 }} />
      </div>

      <Footer />

      {/* ── Cancel Reason Modal ── */}
      {showReasonModal && (
        <div className="modal-overlay" onClick={() => setShowReasonModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "1.05rem", color: "#1a1a2e" }}>Cancellation Reason</h2>
            </div>
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 16px", color: "#7F1D1D", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 20 }}>
              {reasonText}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-modal-cancel" onClick={() => setShowReasonModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Profile Modal ── */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F5F3FF", border: "1px solid #DDD6FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#7c6af7" strokeWidth="2" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#7c6af7" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "1.05rem", color: "#1a1a2e" }}>Edit Profile</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 22 }}>
              {[
                { key: "firstname",  label: "First Name",  type: "text"  },
                { key: "lastname",   label: "Last Name",   type: "text"  },
                { key: "email",      label: "Email",       type: "email" },
                { key: "department", label: "Department",  type: "text"  },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="modal-label">{label}</label>
                  <input
                    type={type} placeholder={label} value={formData[key]}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    onBlur={() => handleFieldBlur(key)}
                    className={`modal-input${formErrors[key] ? " input-error" : ""}`}
                  />
                  {formErrors[key] && (
                    <div className="field-error">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/></svg>
                      {formErrors[key]}
                    </div>
                  )}
                </div>
              ))}

              {saveError && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span style={{ fontSize: "0.8rem", color: "#DC2626" }}>{saveError}</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-modal-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-modal-save" onClick={saveProfile}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
