import { useEffect, useState } from "react";
import API from "../services/api";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
import AvailabilityModal from "../pages/Availabilitymodal";

const LecturerDashboard = () => {
  const [lecturer, setLecturer] = useState({});
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [lecturerRes, statsRes, apptRes] = await Promise.all([
        API.get("/auth/user/profile"),
        API.get("/dashboard/lecturer"),
        API.get("/appointments/lecturer"),
      ]);
      setLecturer(lecturerRes.data.user);
      setStats(statsRes.data);
      setAppointments(apptRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const refreshAppointments = () => fetchData();

  const handleApprove = async (id) => {
    try { await API.put(`/appointments/approve/${id}`); alert("Appointment Approved"); refreshAppointments(); }
    catch (err) { console.error(err); alert("Error approving appointment"); }
  };

  const handleCancel = async (id) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason || reason.trim() === "") return alert("Cancellation reason is required");
    try { await API.put(`/appointments/cancel/${id}`, { reason }); alert("Appointment Cancelled"); refreshAppointments(); }
    catch (err) { console.error(err); alert("Error cancelling appointment"); }
  };

  const handleComplete = async (id) => {
    try { await API.put(`/appointments/complete/${id}`); alert("Appointment Completed"); refreshAppointments(); }
    catch (err) { console.error(err); alert("Error completing appointment"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try { await API.delete(`/appointments/${id}`); alert("Appointment Deleted"); refreshAppointments(); }
    catch (err) { console.error(err); alert("Error deleting appointment"); }
  };

  const filteredAppointments = appointments.filter(a => filter === "all" ? true : a.status === filter);

  const STATUS = {
    approved:  { bg: "#EFF6FF", border: "#BFDBFE", color: "#1D4ED8", dot: "#3B82F6", label: "Approved"  },
    completed: { bg: "#F0FDF4", border: "#BBF7D0", color: "#15803D", dot: "#22C55E", label: "Completed" },
    cancelled: { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626", dot: "#EF4444", label: "Cancelled" },
    pending:   { bg: "#FEFCE8", border: "#FDE68A", color: "#92400E", dot: "#EAB308", label: "Pending"   },
  };

  const filterCounts = {
    all:       appointments.length,
    pending:   appointments.filter(a => a.status === "pending").length,
    approved:  appointments.filter(a => a.status === "approved").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  const statItems = [
    { title: "Total",      value: stats.totalAppointments || 0,                               icon: "📋", color: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE" },
    { title: "Pending",    value: stats.pending    || 0,                                      icon: "⏳", color: "#92400E", bg: "#FEFCE8", border: "#FDE68A" },
    { title: "Approved",   value: stats.approved   || 0,                                      icon: "✅", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
    { title: "Completed",  value: stats.completed  || 0,                                      icon: "🎓", color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
    { title: "Cancelled",  value: stats.cancelled  || 0,                                      icon: "❌", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    { title: "Feedbacks",  value: stats.totalFeedbacks || 0,                                  icon: "💬", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
    { title: "Avg Rating", value: Number(stats.averageRating || 0).toFixed(1),                icon: "⭐", color: "#B45309", bg: "#FFFBEB", border: "#FDE68A" },
  ];

  const tabs = ["all", "pending", "approved", "completed", "cancelled"];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F8F7F4", minHeight: "100vh", color: "#1a1a2e", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ld-nav-btn { padding: 9px 16px; border-radius: 10px; border: 1.5px solid #E8E6E0; background: white; color: #555; font-family: 'DM Sans',sans-serif; font-weight: 500; font-size: 0.82rem; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
        .ld-nav-btn:hover { border-color: #1a1a2e; color: #1a1a2e; }
        .ld-nav-btn-primary { background: #1a1a2e; color: white; border-color: #1a1a2e; box-shadow: 0 2px 8px rgba(26,26,46,0.2); }
        .ld-nav-btn-primary:hover { background: #2d2d4e; transform: translateY(-1px); color: white; }
        .ld-nav-btn-green { background: #15803D; color: white; border-color: #15803D; box-shadow: 0 2px 8px rgba(21,128,61,0.25); }
        .ld-nav-btn-green:hover { background: #166534; transform: translateY(-1px); color: white; }

        .stat-card { border-radius: 14px; padding: 18px 16px; text-align: center; transition: all 0.2s ease; cursor: default; border: 1.5px solid; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }

        .profile-card { background: white; border: 1.5px solid #E8E6E0; border-radius: 18px; padding: 24px 28px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap; position: relative; overflow: hidden; }
        .profile-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, #7c6af7, #a78bfa); border-radius: 99px 0 0 99px; }

        .avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg,#7c6af7,#a78bfa); display: flex; align-items: center; justify-content: center; font-family: Fraunces,serif; font-weight: 900; font-size: 1.4rem; color: white; flex-shrink: 0; box-shadow: 0 6px 20px rgba(124,106,247,0.3); overflow: hidden; }

        .section-card { background: white; border: 1.5px solid #E8E6E0; border-radius: 16px; overflow: hidden; }

        .tab-btn { font-family: 'DM Sans',sans-serif; font-size: 0.82rem; font-weight: 500; padding: 10px 16px; border: none; background: none; cursor: pointer; color: #888; border-bottom: 2px solid transparent; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; }
        .tab-btn:hover { color: #1a1a2e; }
        .tab-btn.active { color: #7c6af7; border-bottom-color: #7c6af7; font-weight: 600; }
        .tab-count { font-size: 0.7rem; background: #F0EEF9; color: #7c6af7; padding: 1px 7px; border-radius: 99px; font-weight: 600; }
        .tab-btn.active .tab-count { background: #EDE9FE; }

        .appt-card { border: 1.5px solid #F0EEF9; border-radius: 14px; padding: 18px 20px; transition: all 0.2s; position: relative; overflow: hidden; background: white; }
        .appt-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg,#7c6af7,#a78bfa); border-radius: 99px 0 0 99px; opacity: 0; transition: opacity 0.2s; }
        .appt-card:hover { border-color: #DDD6FE; box-shadow: 0 6px 24px rgba(124,106,247,0.08); }
        .appt-card:hover::before { opacity: 1; }

        .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 0.72rem; font-weight: 600; border: 1px solid; }

        .field-label { font-size: 0.68rem; color: #999; font-weight: 500; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.06em; }
        .field-val { font-size: 0.88rem; color: #333; font-weight: 500; }

        .btn-approve { font-size: 0.78rem; font-weight: 600; padding: 7px 14px; border-radius: 8px; cursor: pointer; border: 1px solid #BBF7D0; background: #F0FDF4; color: #15803D; font-family: 'DM Sans',sans-serif; transition: all 0.15s; }
        .btn-approve:hover { background: #DCFCE7; }
        .btn-cancel-a { font-size: 0.78rem; font-weight: 600; padding: 7px 14px; border-radius: 8px; cursor: pointer; border: 1px solid #FECACA; background: #FEF2F2; color: #DC2626; font-family: 'DM Sans',sans-serif; transition: all 0.15s; }
        .btn-cancel-a:hover { background: #FEE2E2; }
        .btn-complete { font-size: 0.78rem; font-weight: 600; padding: 7px 14px; border-radius: 8px; cursor: pointer; border: 1px solid #BFDBFE; background: #EFF6FF; color: #1D4ED8; font-family: 'DM Sans',sans-serif; transition: all 0.15s; }
        .btn-complete:hover { background: #DBEAFE; }
        .btn-delete { font-size: 0.78rem; font-weight: 600; padding: 7px 14px; border-radius: 8px; cursor: pointer; border: 1px solid #E8E6E0; background: white; color: #888; font-family: 'DM Sans',sans-serif; transition: all 0.15s; display: inline-flex; align-items: center; gap: 5px; }
        .btn-delete:hover { border-color: #FECACA; background: #FEF2F2; color: #DC2626; }

        .empty-state { padding: 60px 24px; text-align: center; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{ background: "white", borderBottom: "1px solid #E8E6E0", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.5" fill="white" fillOpacity="0.7"/></svg>
            </div>
            <span style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>AcadPortal</span>
            <span style={{ color: "#E8E6E0", margin: "0 4px" }}>·</span>
            <span style={{ fontSize: "0.8rem", color: "#888", fontWeight: 500 }}>Lecturer Dashboard</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="ld-nav-btn" onClick={refreshAppointments}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Refresh
            </button>
            <button className="ld-nav-btn" onClick={() => navigate("/lecture-progress")}>📊 Progress</button>
            <button className="ld-nav-btn ld-nav-btn-green" onClick={() => setShowModal(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Add Availability
            </button>
            <button className="ld-nav-btn ld-nav-btn-primary" onClick={() => navigate("/lecturer-feedback")}>
              ⭐ Student Feedback
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>

        {/* ── Heading ── */}
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.15em", color: "#7c6af7", textTransform: "uppercase", marginBottom: 4 }}>Lecturer Portal</p>
          <h1 style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "2rem", color: "#1a1a2e", letterSpacing: "-0.03em", marginBottom: 4 }}>My Dashboard</h1>
          <p style={{ fontSize: "0.88rem", color: "#888", lineHeight: 1.6 }}>Manage your appointments, availability, and student interactions.</p>
        </div>

        {/* ── Profile card ── */}
        <div className="profile-card">
          <div className="avatar">
            {lecturer.profilePicture
              ? <img src={lecturer.profilePicture} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span>{lecturer.firstname?.[0]}</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "1.25rem", color: "#1a1a2e", marginBottom: 10 }}>
              {lecturer.firstname} {lecturer.lastname}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
              {[["Email", lecturer.email], ["Department", lecturer.department], ["Role", "Lecturer"]].map(([label, value]) => (
                <div key={label}>
                  <div className="field-label">{label}</div>
                  <div className="field-val">{value || "—"}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="ld-nav-btn ld-nav-btn-green" onClick={() => setShowModal(true)} style={{ flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            Add Availability
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
          {statItems.map(({ title, value, icon, color, bg, border }) => (
            <div key={title} className="stat-card" style={{ background: bg, borderColor: border }}>
              <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "1.7rem", color, letterSpacing: "-0.02em" }}>{value}</div>
              <div style={{ fontSize: "0.72rem", color, opacity: 0.65, marginTop: 2, fontWeight: 600 }}>{title}</div>
            </div>
          ))}
        </div>

        {/* ── Appointments section ── */}
        <div className="section-card">
          {/* Header */}
          <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "#F0EEF9", border: "1px solid #DDD6FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📅</div>
              <div>
                <div style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>Appointments</div>
                <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 1 }}>{filteredAppointments.length} of {appointments.length} shown</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", padding: "0 24px", borderBottom: "1px solid #E8E6E0", marginTop: 14, overflowX: "auto", gap: 2 }}>
            {tabs.map(f => (
              <button key={f} className={`tab-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="tab-count">{filterCounts[f]}</span>
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📭</div>
                <div style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "1rem", color: "#374151", marginBottom: 6 }}>No appointments found</div>
                <div style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                  {filter === "all" ? "No appointments yet." : `No ${filter} appointments.`}
                </div>
              </div>
            ) : (
              filteredAppointments.map(appt => {
                const sc = STATUS[appt.status] || STATUS.pending;
                return (
                  <div key={appt._id} className="appt-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>

                      {/* Student info */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 11, background: "#F0EEF9", border: "1px solid #DDD6FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👤</div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "0.95rem" }}>
                            {appt.student?.firstname} {appt.student?.lastname}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#999", marginTop: 1 }}>Student</div>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                        <div>
                          <div className="field-label">Date</div>
                          <div className="field-val">{new Date(appt.date).toDateString()}</div>
                        </div>
                        <div>
                          <div className="field-label">Time</div>
                          <div className="field-val" style={{ fontFamily: "monospace" }}>{appt.startTime || "—"}</div>
                        </div>
                      </div>

                      {/* Status + Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className="badge" style={{ background: sc.bg, borderColor: sc.border, color: sc.color }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                          {sc.label}
                        </span>

                        {appt.status === "pending" && (
                          <>
                            <button className="btn-approve" onClick={() => handleApprove(appt._id)}>✓ Approve</button>
                            <button className="btn-cancel-a" onClick={() => handleCancel(appt._id)}>✕ Cancel</button>
                          </>
                        )}
                        {appt.status === "approved" && (
                          <button className="btn-complete" onClick={() => handleComplete(appt._id)}>🎓 Complete</button>
                        )}
                        <button className="btn-delete" onClick={() => handleDelete(appt._id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Footer />

      {showModal && <AvailabilityModal closeModal={() => setShowModal(false)} />}
    </div>
  );
};

export default LecturerDashboard;
