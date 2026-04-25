import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };
const COLORS = { 1: "#DC2626", 2: "#EA580C", 3: "#92400E", 4: "#1D4ED8", 5: "#15803D" };
const BG    = { 1: "#FEF2F2", 2: "#FFF7ED", 3: "#FEFCE8", 4: "#EFF6FF", 5: "#F0FDF4" };

export default function Feedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const active = hovered || rating;

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return alert("Please write a comment");
    try {
      setLoading(true);
      await API.post(`/feedback/submit/${id}`, { rating, comment });
      navigate("/feedback-history");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error submitting feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: "100vh", background: "#F8F7F4", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .star-btn { background: none; border: none; cursor: pointer; padding: 4px 6px; font-size: 2rem; line-height: 1; transition: transform 0.15s ease; display: inline-block; }
        .star-btn:hover { transform: scale(1.25); }
        .fb-textarea {
          width: 100%; padding: 13px 14px; border: 1.5px solid #E8E6E0; border-radius: 12px;
          outline: none; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: #1a1a2e;
          resize: vertical; line-height: 1.65; transition: border-color 0.2s, box-shadow 0.2s;
          background: white;
        }
        .fb-textarea::placeholder { color: #bbb; }
        .fb-textarea:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.12); }
        .submit-btn {
          width: 100%; padding: 14px; border-radius: 12px; border: none; cursor: pointer;
          background: #1a1a2e; color: white; font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 0.95rem; display: flex; align-items: center;
          justify-content: center; gap: 8px; transition: all 0.2s ease;
        }
        .submit-btn:hover:not(:disabled) { background: #2d2d4e; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .spinner { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Back link */}
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#888", fontSize: "0.85rem", fontFamily: "DM Sans, sans-serif", marginBottom: 20, padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.5" fill="white" fillOpacity="0.7"/></svg>
          </div>
          <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>AcadPortal</span>
        </div>

        {/* Card */}
        <div style={{ background: "white", border: "1px solid #E8E6E0", borderRadius: 24, padding: "36px 36px 32px", boxShadow: "0 20px 60px rgba(26,26,46,0.08)" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#FEFCE8", border: "1px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 16px" }}>⭐</div>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", color: "#f59e0b", textTransform: "uppercase", marginBottom: 6 }}>Session Review</p>
            <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: "1.7rem", color: "#1a1a2e", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 8 }}>
              Leave your feedback.
            </h1>
            <p style={{ fontSize: "0.88rem", color: "#888", lineHeight: 1.65 }}>Your review helps improve the academic experience for everyone.</p>
          </div>

          <form onSubmit={submitFeedback} style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            {/* Star rating */}
            <div style={{ background: BG[active], border: `1.5px solid ${BG[active] === "#F0FDF4" ? "#BBF7D0" : BG[active] === "#EFF6FF" ? "#BFDBFE" : BG[active] === "#FEFCE8" ? "#FDE68A" : BG[active] === "#FFF7ED" ? "#FED7AA" : "#FECACA"}`, borderRadius: 16, padding: "22px 20px", textAlign: "center", transition: "all 0.25s ease" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.12em", color: COLORS[active], textTransform: "uppercase", marginBottom: 14, opacity: 0.7 }}>Your Rating</p>
              <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 10 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="star-btn"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                  >
                    <span style={{ color: star <= active ? "#f59e0b" : "#E8E6E0", transition: "color 0.15s" }}>★</span>
                  </button>
                ))}
              </div>
              <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "1.1rem", color: COLORS[active], letterSpacing: "-0.01em", transition: "all 0.2s" }}>
                {LABELS[active]}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "#555", marginBottom: 8, display: "block" }}>Your Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="fb-textarea"
                rows={5}
                placeholder="Share your experience with this session — what went well, what could be improved…"
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <span style={{ fontSize: "0.78rem", color: "#bbb" }}>Be honest and constructive</span>
                <span style={{ fontSize: "0.75rem", color: comment.length > 0 ? "#7c6af7" : "#ccc", fontWeight: 500, fontFamily: "monospace" }}>{comment.length} chars</span>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? (
                <>
                  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
                  Submitting…
                </>
              ) : (
                <>
                  Submit Feedback
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#bbb", marginTop: 18 }}>
          Changed your mind?{" "}
          <span onClick={() => navigate(-1)} style={{ color: "#7c6af7", cursor: "pointer", fontWeight: 600 }}>Go back</span>
        </p>
      </div>
    </div>
  );
}
