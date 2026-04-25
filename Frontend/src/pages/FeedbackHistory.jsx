import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const RATING_COLORS = { 1: "#DC2626", 2: "#EA580C", 3: "#92400E", 4: "#1D4ED8", 5: "#15803D" };
const RATING_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };
const RATING_BG     = { 1: "#FEF2F2", 2: "#FFF7ED", 3: "#FEFCE8", 4: "#EFF6FF", 5: "#F0FDF4" };
const RATING_BDR    = { 1: "#FECACA", 2: "#FED7AA", 3: "#FDE68A", 4: "#BFDBFE", 5: "#BBF7D0" };

export default function FeedbackHistory() {
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/feedback/student")
      .then(r => setFeedbacks(r.data))
      .catch(e => console.error(e));
  }, []);

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  const countFor = (n) => feedbacks.filter(f => f.rating === n).length;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F8F7F4", minHeight: "100vh", color: "#1a1a2e" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fh-btn { padding: 9px 18px; border-radius: 10px; border: 1.5px solid #E8E6E0; background: white; color: #555; font-family: 'DM Sans',sans-serif; font-weight: 500; font-size: 0.84rem; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
        .fh-btn:hover { border-color: #1a1a2e; color: #1a1a2e; }
        .fh-card { background: white; border: 1px solid #E8E6E0; border-radius: 16px; padding: 22px 24px; transition: all 0.2s; }
        .fh-card:hover { box-shadow: 0 8px 30px rgba(26,26,46,0.08); border-color: #c5c0b8; transform: translateY(-1px); }
        .bar-bg { flex: 1; height: 6px; border-radius: 99px; background: #F0EEF9; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg,#f59e0b,#f97316); transition: width 0.6s ease; }
        .star-on  { color: #f59e0b; font-size: 15px; }
        .star-off { color: #E8E6E0; font-size: 15px; }
        .section-label { font-size: 0.7rem; color: #999; font-weight: 500; margin-bottom: 2px; letter-spacing: 0.06em; text-transform: uppercase; }
        .section-val { font-size: 0.88rem; color: #444; }
        .comment-block { background: #FAFAF8; border: 1px solid #E8E6E0; border-left: 3px solid #f59e0b; border-radius: 10px; padding: 12px 14px; margin-top: 14px; font-size: 0.88rem; color: #555; line-height: 1.7; }
      `}</style>

      {/* Top nav */}
      <nav style={{ background: "white", borderBottom: "1px solid #E8E6E0", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.5" fill="white" fillOpacity="0.7"/></svg>
            </div>
            <span style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>AcadPortal</span>
            <span style={{ color: "#E8E6E0", margin: "0 4px" }}>·</span>
            <span style={{ fontSize: "0.8rem", color: "#888", fontWeight: 500 }}>Feedback History</span>
          </div>
          <button className="fh-btn" onClick={() => navigate("/student")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Page heading */}
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.15em", color: "#f59e0b", textTransform: "uppercase", marginBottom: 4 }}>Student Portal</p>
          <h1 style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "2rem", color: "#1a1a2e", letterSpacing: "-0.03em" }}>
            Feedback History
          </h1>
        </div>

        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {[
            { label: "Total Submitted",  value: feedbacks.length,                          color: "#7c6af7", bg: "#F0EEF9" },
            { label: "Average Rating",   value: avgRating ? `${avgRating} ★` : "—",         color: "#92400E", bg: "#FEFCE8" },
            { label: "5-Star Reviews",   value: countFor(5),                                color: "#15803D", bg: "#F0FDF4" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: 14, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "2rem", color, letterSpacing: "-0.02em" }}>{value}</div>
              <div style={{ fontSize: "0.74rem", color, opacity: 0.65, marginTop: 2, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Rating distribution */}
        {feedbacks.length > 0 && (
          <div style={{ background: "white", border: "1px solid #E8E6E0", borderRadius: 16, padding: "22px 24px" }}>
            <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "1rem", color: "#1a1a2e", marginBottom: 18 }}>Rating Breakdown</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = countFor(star);
                const pct = feedbacks.length ? (count / feedbacks.length) * 100 : 0;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: "0.78rem", color: "#888", width: 10, textAlign: "right", flexShrink: 0, fontWeight: 500 }}>{star}</span>
                    <span style={{ color: "#f59e0b", fontSize: "0.78rem", flexShrink: 0 }}>★</span>
                    <div className="bar-bg">
                      <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#999", width: 20, textAlign: "right", flexShrink: 0, fontFamily: "monospace" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback list */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "1.1rem", color: "#1a1a2e" }}>All Feedback</h2>
            <span style={{ fontSize: "0.8rem", color: "#999" }}>{feedbacks.length} submitted</span>
          </div>

          {feedbacks.length === 0 ? (
            <div style={{ background: "white", border: "1px solid #E8E6E0", borderRadius: 16, padding: "60px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>💬</div>
              <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: 6 }}>No feedback submitted yet.</p>
              <p style={{ color: "#bbb", fontSize: "0.82rem" }}>Complete an appointment to leave your first review.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {feedbacks.map(fb => (
                <div key={fb._id} className="fh-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>

                    {/* Lecturer info */}
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: "#FEFCE8", border: "1px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎓</div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "0.95rem" }}>
                          {fb.lecturer?.firstname} {fb.lecturer?.lastname}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>Lecturer</div>
                      </div>
                    </div>

                    {/* Session date + rating badge */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      {fb.appointment && (
                        <div style={{ textAlign: "right" }}>
                          <div className="section-label">Session</div>
                          <div className="section-val">{new Date(fb.appointment.date).toDateString()} · {fb.appointment.startTime}</div>
                        </div>
                      )}
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: RATING_BG[fb.rating], border: `1px solid ${RATING_BDR[fb.rating]}`, color: RATING_COLORS[fb.rating], fontSize: "0.75rem", fontWeight: 600 }}>
                        <span style={{ fontSize: 12 }}>★</span>
                        {RATING_LABELS[fb.rating]}
                      </span>
                    </div>
                  </div>

                  {/* Star row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= fb.rating ? "star-on" : "star-off"}>★</span>
                      ))}
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "#999", fontFamily: "monospace" }}>{fb.rating}/5</span>
                  </div>

                  {/* Comment */}
                  {fb.comment && (
                    <div className="comment-block">
                      <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Comment</span>
                      {fb.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
