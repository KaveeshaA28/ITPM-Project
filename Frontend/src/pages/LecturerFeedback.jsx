  import { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import API from "../services/api";

  const RATING_COLORS = { 1: "#DC2626", 2: "#EA580C", 3: "#92400E", 4: "#1D4ED8", 5: "#15803D" };
  const RATING_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };
  const RATING_BG     = { 1: "#FEF2F2", 2: "#FFF7ED", 3: "#FEFCE8", 4: "#EFF6FF", 5: "#F0FDF4" };
  const RATING_BDR    = { 1: "#FECACA", 2: "#FED7AA", 3: "#FDE68A", 4: "#BFDBFE", 5: "#BBF7D0" };

  export default function LecturerFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
      API.get("/feedback/lecturer")
        .then(r => { setFeedbacks(r.data.feedbacks); setAverageRating(r.data.averageRating); setTotalReviews(r.data.totalReviews); })
        .catch(console.error);
    }, []);

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: feedbacks.filter(f => f.rating === star).length,
      pct: feedbacks.length ? (feedbacks.filter(f => f.rating === star).length / feedbacks.length) * 100 : 0,
    }));

    const fiveStars = feedbacks.filter(f => f.rating === 5).length;

    return (
      <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F8F7F4", minHeight: "100vh", color: "#1a1a2e" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .lf-btn { padding: 9px 18px; border-radius: 10px; border: 1.5px solid #E8E6E0; background: white; color: #555; font-family: 'DM Sans',sans-serif; font-weight: 500; font-size: 0.84rem; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
          .lf-btn:hover { border-color: #1a1a2e; color: #1a1a2e; }
          .fb-card { background: white; border: 1px solid #E8E6E0; border-radius: 14px; padding: 20px 22px; transition: all 0.2s; }
          .fb-card:hover { box-shadow: 0 8px 30px rgba(26,26,46,0.08); border-color: #c5c0b8; transform: translateY(-1px); }
          .bar-bg { flex: 1; height: 6px; border-radius: 99px; background: #F0EEF9; overflow: hidden; }
          .bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg,#f59e0b,#f97316); transition: width 0.6s ease; }
          .star-on  { color: #f59e0b; font-size: 15px; }
          .star-off { color: #E8E6E0; font-size: 15px; }
          .avatar-sm { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg,#7c6af7,#a78bfa); display: flex; align-items: center; justify-content: center; font-family: Fraunces,serif; font-weight: 900; font-size: 0.85rem; color: white; flex-shrink: 0; }
          .comment-block { background: #FAFAF8; border: 1px solid #E8E6E0; border-left: 3px solid #f59e0b; border-radius: 10px; padding: 12px 14px; margin-top: 14px; font-size: 0.88rem; color: #555; line-height: 1.7; }
          .section-label { font-size: 0.7rem; color: #999; font-weight: 500; margin-bottom: 2px; letter-spacing: 0.06em; text-transform: uppercase; }
        `}</style>

        {/* Nav */}
        <nav style={{ background: "white", borderBottom: "1px solid #E8E6E0", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.5" fill="white" fillOpacity="0.7"/></svg>
              </div>
              <span style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>AcadPortal</span>
              <span style={{ color: "#E8E6E0", margin: "0 4px" }}>·</span>
              <span style={{ fontSize: "0.8rem", color: "#888", fontWeight: 500 }}>Student Feedback</span>
            </div>
            <button className="lf-btn" onClick={() => navigate("/lecturer")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Dashboard
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Heading */}
          <div>
            <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.15em", color: "#f59e0b", textTransform: "uppercase", marginBottom: 4 }}>Lecturer Portal</p>
            <h1 style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "2rem", color: "#1a1a2e", letterSpacing: "-0.03em" }}>
              Student Feedback
            </h1>
          </div>

          {/* Summary panel */}
          <div style={{ background: "white", border: "1px solid #E8E6E0", borderRadius: 18, padding: "24px 28px", display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center" }}>

            {/* Big rating */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "3.5rem", color: "#f59e0b", lineHeight: 1, letterSpacing: "-0.04em" }}>
                {Number(averageRating).toFixed(1)}
              </div>
              <div style={{ display: "flex", gap: 3, justifyContent: "center", margin: "8px 0 4px" }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= Math.round(averageRating) ? "#f59e0b" : "#E8E6E0", fontSize: 18 }}>★</span>
                ))}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#888", fontWeight: 500 }}>Average Rating</div>
            </div>

            <div style={{ width: 1, height: 80, background: "#E8E6E0", flexShrink: 0 }}></div>

            {/* Stat tiles */}
            {[
              { label: "Total Reviews", value: totalReviews, color: "#7c6af7", bg: "#F0EEF9" },
              { label: "5-Star Reviews", value: fiveStars, color: "#92400E", bg: "#FEFCE8" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, borderRadius: 14, padding: "16px 20px", textAlign: "center", minWidth: 110 }}>
                <div style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "2rem", color, letterSpacing: "-0.02em" }}>{value}</div>
                <div style={{ fontSize: "0.74rem", color, opacity: 0.65, marginTop: 2, fontWeight: 500 }}>{label}</div>
              </div>
            ))}

            {/* Rating bars */}
            <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 8 }}>
              {ratingCounts.map(({ star, count, pct }) => (
                <div key={star} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "0.78rem", color: "#888", width: 10, textAlign: "right", flexShrink: 0, fontWeight: 500 }}>{star}</span>
                  <span style={{ color: "#f59e0b", fontSize: "0.78rem", flexShrink: 0 }}>★</span>
                  <div className="bar-bg"><div className="bar-fill" style={{ width: `${pct}%` }}></div></div>
                  <span style={{ fontSize: "0.72rem", color: "#999", width: 18, textAlign: "right", flexShrink: 0, fontFamily: "monospace" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback list */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "1.1rem", color: "#1a1a2e" }}>All Reviews</h2>
              <span style={{ fontSize: "0.8rem", color: "#999" }}>{feedbacks.length} total</span>
            </div>

            {feedbacks.length === 0 ? (
              <div style={{ background: "white", border: "1px solid #E8E6E0", borderRadius: 16, padding: "60px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⭐</div>
                <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: 6 }}>No feedback received yet.</p>
                <p style={{ color: "#bbb", fontSize: "0.82rem" }}>Feedback will appear here after students complete appointments.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {feedbacks.map(fb => (
                  <div key={fb._id} className="fb-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>

                      {/* Student */}
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div className="avatar-sm">
                          {fb.student?.firstname?.[0]}{fb.student?.lastname?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "0.95rem" }}>
                            {fb.student?.firstname} {fb.student?.lastname}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 1 }}>Student</div>
                        </div>
                      </div>

                      {/* Rating badge + stars */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ display: "flex", gap: 2 }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={s <= fb.rating ? "star-on" : "star-off"}>★</span>
                          ))}
                        </div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 99, background: RATING_BG[fb.rating], border: `1px solid ${RATING_BDR[fb.rating]}`, color: RATING_COLORS[fb.rating], fontSize: "0.72rem", fontWeight: 600 }}>
                          {RATING_LABELS[fb.rating]}
                        </span>
                      </div>
                    </div>

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
