import { useEffect, useState } from "react";
import API from "../services/api";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";

const STATUS = {
  approved:  { bg: "#EFF6FF", border: "#BFDBFE", color: "#1D4ED8", dot: "#3B82F6", label: "Approved"  },
  completed: { bg: "#F0FDF4", border: "#BBF7D0", color: "#15803D", dot: "#22C55E", label: "Completed" },
  cancelled: { bg: "#FEF2F2", border: "#FECACA", color: "#DC2626", dot: "#EF4444", label: "Cancelled" },
  pending:   { bg: "#FEFCE8", border: "#FDE68A", color: "#92400E", dot: "#EAB308", label: "Pending"   },
};

export default function StudentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();         

  useEffect(() => {
    API.get("/appointments/student").then(r => setAppointments(r.data)).catch(console.error);    
  }, []);

  const total     = appointments.length;
  const approved  = appointments.filter(a => a.status === "approved").length;
  const pending   = appointments.filter(a => a.status === "pending").length;
  const cancelled = appointments.filter(a => a.status === "cancelled").length;

  const filtered = filter === "all" ? appointments : appointments.filter(a => a.status === filter);

  const tabs = [
    { key: "all",       label: "All",       count: total     },
    { key: "approved",  label: "Approved",  count: approved  },
    { key: "pending",   label: "Pending",   count: pending   },
    { key: "cancelled", label: "Cancelled", count: cancelled },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F8F7F4", minHeight: "100vh", color: "#1a1a2e", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .sh-btn { padding: 9px 18px; border-radius: 10px; border: 1.5px solid #E8E6E0; background: white; color: #555; font-family: 'DM Sans',sans-serif; font-weight: 500; font-size: 0.84rem; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
        .sh-btn:hover { border-color: #1a1a2e; color: #1a1a2e; }
        .sh-btn-primary { background: #1a1a2e; color: white; border-color: #1a1a2e; box-shadow: 0 2px 8px rgba(26,26,46,0.2); }
        .sh-btn-primary:hover { background: #2d2d4e; transform: translateY(-1px); }

        .tab-btn { font-family: 'DM Sans',sans-serif; font-size: 0.82rem; font-weight: 500; padding: 9px 16px; border: none; background: none; cursor: pointer; color: #888; border-bottom: 2px solid transparent; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px; }
        .tab-btn:hover { color: #1a1a2e; }
        .tab-btn.active { color: #7c6af7; border-bottom-color: #7c6af7; font-weight: 600; }

        .tab-count { font-size: 0.7rem; background: #F0EEF9; color: #7c6af7; padding: 1px 7px; border-radius: 99px; font-weight: 600; }
        .tab-btn.active .tab-count { background: #EDE9FE; }

        .appt-card { background: white; border: 1.5px solid #E8E6E0; border-radius: 16px; padding: 22px 24px; display: flex; flex-direction: column; gap: 14px; transition: all 0.2s; position: relative; overflow: hidden; }
        .appt-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg, #7c6af7, #a78bfa); border-radius: 99px 0 0 99px; opacity: 0; transition: opacity 0.2s; }
        .appt-card:hover { box-shadow: 0 8px 30px rgba(26,26,46,0.08); border-color: #c5c0f0; transform: translateY(-1px); }
        .appt-card:hover::before { opacity: 1; }

        .badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 0.72rem; font-weight: 600; border: 1px solid; }
        .field-label { font-size: 0.68rem; color: #999; font-weight: 500; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.06em; }
        .field-val { font-size: 0.88rem; color: #444; font-weight: 500; }

        .cancel-box { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 11px 14px; }
        .history-box { background: #FAFAF8; border: 1px solid #E8E6E0; border-radius: 10px; padding: 12px 14px; max-height: 130px; overflow-y: auto; }
        .history-box::-webkit-scrollbar { width: 3px; }
        .history-box::-webkit-scrollbar-thumb { background: #E8E6E0; border-radius: 99px; }
        .history-row { font-size: 0.78rem; color: #888; padding: 5px 0; border-bottom: 1px solid #F0EEF9; display: flex; gap: 8px; align-items: flex-start; }
        .history-row:last-child { border-bottom: none; padding-bottom: 0; }

        .empty-state { background: white; border: 1.5px solid #E8E6E0; border-radius: 16px; padding: 60px 24px; text-align: center; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{ background: "white", borderBottom: "1px solid #E8E6E0", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.5" fill="white" fillOpacity="0.7"/></svg>
            </div>
            <span style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>AcadPortal</span>
            <span style={{ color: "#E8E6E0", margin: "0 4px" }}>·</span>
            <span style={{ fontSize: "0.8rem", color: "#888", fontWeight: 500 }}>Appointment History</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="sh-btn" onClick={() => navigate("/student")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Dashboard
            </button>
            <button className="sh-btn sh-btn-primary" onClick={() => navigate("/student-progress")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 20V10M12 20V4M6 20v-6" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
              View Progress
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>

        {/* ── Heading ── */}
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.15em", color: "#7c6af7", textTransform: "uppercase", marginBottom: 4 }}>Student Portal</p>
          <h1 style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "2rem", color: "#1a1a2e", letterSpacing: "-0.03em", marginBottom: 4 }}>Appointment History</h1>
          <p style={{ fontSize: "0.88rem", color: "#888", lineHeight: 1.6 }}>View and track all your past and upcoming appointments.</p>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
          {[
            { label: "Total",     value: total,     color: "#7c6af7", bg: "#F0EEF9", border: "#DDD6FE" },
            { label: "Approved",  value: approved,  color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
            { label: "Pending",   value: pending,   color: "#92400E", bg: "#FEFCE8", border: "#FDE68A" },
            { label: "Cancelled", value: cancelled, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 14, padding: "18px 16px", textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}
              onClick={() => setFilter(label.toLowerCase())}>
              <div style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "2rem", color, letterSpacing: "-0.02em" }}>{value}</div>
              <div style={{ fontSize: "0.74rem", color, opacity: 0.75, marginTop: 2, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── Appointments section ── */}
        <div style={{ background: "white", border: "1.5px solid #E8E6E0", borderRadius: 16, overflow: "hidden" }}>

          {/* Section header */}
          <div style={{ padding: "18px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📅</div>
              <div>
                <div style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>All Appointments</div>
                <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 1 }}>{filtered.length} of {total} records</div>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", padding: "0 24px", borderBottom: "1px solid #E8E6E0", marginTop: 14, overflowX: "auto", gap: 2 }}>
            {tabs.map(({ key, label, count }) => (
              <button key={key} className={`tab-btn ${filter === key ? "active" : ""}`} onClick={() => setFilter(key)}>
                {label}
                <span className="tab-count">{count}</span>
              </button>
            ))}
          </div>

          {/* Cards */}
          <div style={{ padding: "16px 24px 24px" }}>
            {filtered.length === 0 ? (
              <div className="empty-state" style={{ border: "none", background: "transparent" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📭</div>
                <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: 20 }}>
                  {filter === "all" ? "No appointment history found." : `No ${filter} appointments.`}
                </p>
                {filter === "all" && (
                  <button className="sh-btn sh-btn-primary" onClick={() => navigate("/book-appointment")}>+ Book Appointment</button>
                )}
                {filter !== "all" && (
                  <button className="sh-btn" onClick={() => setFilter("all")}>View all appointments</button>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 14 }}>
                {filtered.map(app => {
                  const sc = STATUS[app.status] || STATUS.pending;
                  return (
                    <div key={app._id} className="appt-card">

                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <div style={{ width: 42, height: 42, borderRadius: 11, background: "#F0EEF9", border: "1px solid #DDD6FE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎓</div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "0.95rem" }}>
                              {app.lecturer?.firstname} {app.lecturer?.lastname}
                            </div>
                            <div style={{ fontSize: "0.74rem", color: "#999", marginTop: 1 }}>Lecturer</div>
                          </div>
                        </div>
                        <span className="badge" style={{ background: sc.bg, borderColor: sc.border, color: sc.color }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                          {sc.label}
                        </span>
                      </div>

                      {/* Date / Time */}
                      <div style={{ display: "flex", gap: 28 }}>
                        <div>
                          <div className="field-label">Date</div>
                          <div className="field-val">{new Date(app.date).toDateString()}</div>
                        </div>
                        <div>
                          <div className="field-label">Time</div>
                          <div className="field-val">{app.startTime}{app.endTime ? ` – ${app.endTime}` : ""}</div>
                        </div>
                        {app.message && (
                          <div style={{ flex: 1 }}>
                            <div className="field-label">Purpose</div>
                            <div className="field-val" style={{ fontSize: "0.82rem", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>{app.message}</div>
                          </div>
                        )}
                      </div>

                      {/* Cancel reason */}
                      {app.status === "cancelled" && app.cancelReason && (
                        <div className="cancel-box">
                          <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/></svg>
                            Cancel Reason
                          </div>
                          <p style={{ fontSize: "0.85rem", color: "#7f1d1d", lineHeight: 1.6 }}>{app.cancelReason}</p>
                        </div>
                      )}

                      {/* Cancel history */}
                      {app.cancelHistory?.length > 0 && (
                        <div>
                          <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>
                            Cancel History ({app.cancelHistory.length})
                          </div>
                          <div className="history-box">
                            {app.cancelHistory.map((h, i) => (
                              <div key={i} className="history-row">
                                <span style={{ color: "#bbb", fontFamily: "monospace", fontSize: "0.75rem", flexShrink: 0 }}>[{new Date(h.date).toLocaleString()}]</span>
                                <span><span style={{ color: "#7c6af7", fontWeight: 600 }}>{h.cancelledBy}</span> — {h.reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
