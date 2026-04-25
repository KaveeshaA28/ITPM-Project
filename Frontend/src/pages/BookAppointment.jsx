// BookAppointment - Developed by Amarasekara N.K.K.T (IT23233362)
import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function BookAppointment() {
  const navigate = useNavigate();
  const [lecturers, setLecturers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [message, setMessage] = useState("");
  const [messageTouched, setMessageTouched] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [recommendedLecturer, setRecommendedLecturer] = useState(null);
  const [recommendedSlots, setRecommendedSlots] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState("");
  const [bookingErrors, setBookingErrors] = useState({ lecturer: "", slot: "", message: "" });

  const MIN_MESSAGE = 10;
  const MAX_MESSAGE = 300;

  useEffect(() => {
    API.get("/auth/lecturers")
      .then(r => { if (Array.isArray(r.data?.data)) setLecturers(r.data.data); })
      .catch(console.error);
  }, []);

  const validateMessage = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return "Purpose of meeting is required.";
    if (trimmed.length < MIN_MESSAGE) return `Please enter at least ${MIN_MESSAGE} characters (${trimmed.length}/${MIN_MESSAGE}).`;
    if (val.length > MAX_MESSAGE) return `Maximum ${MAX_MESSAGE} characters allowed.`;
    if (/^\d+$/.test(trimmed)) return "Numbers only is not allowed — please describe in words.";
    if (/^[^a-zA-Z]+$/.test(trimmed)) return "Symbols or numbers only is not allowed — use real words.";
    if (/^(.)\1+$/i.test(trimmed)) return "Repeated characters are not allowed — write a real description.";
    const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 3) return "Please write at least 3 words to describe your purpose.";
    if (!/[a-zA-Z]{2,}/.test(trimmed)) return "Purpose must include meaningful words, not just single letters.";
    return "";
  };

  const loadSlots = async (id) => {
    setSelectedLecturer(id);
    setSelectedSlot("");
    setSlots([]);
    setBookingErrors(p => ({ ...p, lecturer: "" }));
    if (!id) return;
    try {
      setLoadingSlots(true);
      const r = await API.get(`/availability/lecturer/${id}`);
      if (Array.isArray(r.data)) setSlots(r.data);
    } catch (e) { console.error(e); }
    finally { setLoadingSlots(false); }
  };

  const aiRecommendLecturer = async () => {
    setLoadingAI(true); setError("");
    try {
      const r = await API.get("/ai/best/recommend");
      if (r.data?.lecturerId) {
        setRecommendedLecturer(r.data);
        setSelectedLecturer(r.data.lecturerId);
        setBookingErrors(p => ({ ...p, lecturer: "" }));
        const sr = await API.get(`/availability/lecturer/${r.data.lecturerId}`);
        if (Array.isArray(sr.data)) setSlots(sr.data);
      } else setError("No recommended lecturer found");
    } catch (e) { console.error(e); setError("AI lecturer recommendation failed"); }
    finally { setLoadingAI(false); }
  };

  const aiRecommendSlot = async () => {
    const lid = recommendedLecturer?.lecturerId || selectedLecturer;
    if (!lid) { setBookingErrors(p => ({ ...p, lecturer: "Please select a lecturer before requesting AI slot recommendations." })); return; }
    setLoadingAI(true); setError("");
    try {
      const r = await API.get(`/ai/recommend/${lid}`);
      if (r.data?.recommendedSlots) setRecommendedSlots(r.data.recommendedSlots);
      else setError(r.data.message || "No recommended slots found");
    } catch (e) { console.error(e); setError("AI time slot recommendation failed"); }
    finally { setLoadingAI(false); }
  };

  const bookAppointment = async () => {
    const msgErr = validateMessage(message);
    const errs = {
      lecturer: !selectedLecturer ? "Please select a lecturer before booking." : "",
      slot: !selectedSlot ? "Please select a time slot before booking." : "",
      message: msgErr,
    };
    setBookingErrors(errs);
    setMessageTouched(true);
    if (errs.lecturer || errs.slot || errs.message) return;
    try {
      await API.post("/appointments/book", { slotId: selectedSlot, message });
      alert("Appointment booked successfully!");
      setSelectedSlot(""); setMessage(""); setSlots([]);
      setSelectedLecturer(""); setRecommendedLecturer(null); setRecommendedSlots([]);
      setBookingErrors({ lecturer: "", slot: "", message: "" });
      setMessageTouched(false);
    } catch (e) { alert(e.response?.data?.message || "Booking failed"); }
  };

  const clearAI = () => {
    setRecommendedLecturer(null); setRecommendedSlots([]);
    setSelectedLecturer(""); setSelectedSlot(""); setSlots([]);
    setMessage(""); setError(""); setBookingErrors({ lecturer: "", slot: "", message: "" });
    setMessageTouched(false);
  };

  // Live message validation
  const messageError = messageTouched ? validateMessage(message) : "";
  const messageOk = !messageError && message.trim().length >= MIN_MESSAGE;

  // Progress bar color
  const charPct = Math.min((message.length / MAX_MESSAGE) * 100, 100);
  const barColor = message.length > MAX_MESSAGE ? "#EF4444" : messageOk ? "#16A34A" : "#7c6af7";

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F8F7F4", minHeight: "100vh", color: "#1a1a2e" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ba-nav-btn { padding: 9px 18px; border-radius: 10px; border: 1.5px solid #E8E6E0; background: white; color: #555; font-family: 'DM Sans',sans-serif; font-weight: 500; font-size: 0.84rem; cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
        .ba-nav-btn:hover { border-color: #1a1a2e; color: #1a1a2e; }

        .section-card { background: white; border: 1.5px solid #E8E6E0; border-radius: 16px; padding: 24px; transition: border-color 0.2s; }
        .section-card.has-error { border-color: #FECACA !important; }
        .section-card.is-valid { border-color: #BBF7D0 !important; }

        .ba-select {
          width: 100%; padding: 12px 40px 12px 14px; border: 1.5px solid #E8E6E0;
          border-radius: 11px; outline: none; color: #1a1a2e; background: white;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
          transition: all 0.2s ease; appearance: none; cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%23aaa' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center;
        }
        .ba-select:focus { border-color: #7c6af7; box-shadow: 0 0 0 3px rgba(124,106,247,0.1); }
        .ba-select.select-error { border-color: #FECACA; box-shadow: 0 0 0 3px rgba(239,68,68,0.08); }

        .ba-textarea {
          width: 100%; padding: 12px 14px; border: 1.5px solid #E8E6E0; border-radius: 11px;
          outline: none; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: #1a1a2e;
          resize: vertical; line-height: 1.65; transition: all 0.2s; background: white;
          min-height: 110px;
        }
        .ba-textarea::placeholder { color: #bbb; }
        .ba-textarea:focus { border-color: #7c6af7; box-shadow: 0 0 0 3px rgba(124,106,247,0.1); }
        .ba-textarea.textarea-error { border-color: #FECACA !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.08) !important; }
        .ba-textarea.textarea-valid { border-color: #BBF7D0 !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.08) !important; }

        .slot-card { background: #FAFAF8; border: 1.5px solid #E8E6E0; border-radius: 12px; padding: 14px; text-align: left; cursor: pointer; transition: all 0.18s; font-family: 'DM Sans', sans-serif; width: 100%; }
        .slot-card:hover { border-color: #7c6af7; background: #F5F3FF; }
        .slot-card.selected { background: #EEF2FF; border-color: #7c6af7; box-shadow: 0 0 0 2px rgba(124,106,247,0.18); }

        .ai-slot-card { background: #F5F3FF; border: 1.5px solid #DDD6FE; border-radius: 12px; padding: 14px; text-align: left; cursor: pointer; transition: all 0.18s; font-family: 'DM Sans', sans-serif; width: 100%; }
        .ai-slot-card:hover { border-color: #7c6af7; background: #EDE9FE; }

        .btn-ai { background: #F5F3FF; border: 1.5px solid #DDD6FE; color: #7c3aed; font-family: 'DM Sans',sans-serif; font-weight: 600; font-size: 0.85rem; padding: 10px 18px; border-radius: 10px; cursor: pointer; transition: all 0.18s; display: inline-flex; align-items: center; gap: 7px; }
        .btn-ai:hover:not(:disabled) { background: #EDE9FE; border-color: #7c6af7; }
        .btn-ai:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-book { background: #1a1a2e; color: white; font-weight: 600; border: none; cursor: pointer; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; padding: 14px 36px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 9px; box-shadow: 0 4px 16px rgba(26,26,46,0.25); }
        .btn-book:hover { background: #2d2d4e; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(26,26,46,0.35); }

        .ai-panel { background: #F5F3FF; border: 1.5px solid #DDD6FE; border-radius: 16px; padding: 22px 24px; position: relative; }

        .field-error { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #DC2626; margin-top: 8px; animation: errIn 0.18s ease; }
        .field-success { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #16A34A; margin-top: 8px; animation: errIn 0.18s ease; }
        @keyframes errIn { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: translateY(0); } }

        .conf-bar-bg { height: 4px; border-radius: 99px; background: #DDD6FE; overflow: hidden; margin-top: 8px; }
        .conf-bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg,#7c3aed,#a78bfa); }

        .char-bar-bg { height: 3px; border-radius: 99px; background: #F0EEE8; overflow: hidden; margin-top: 10px; }

        .spinner { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .ai-dot { width: 6px; height: 6px; background: #7c3aed; border-radius: 50%; animation: blink 2s infinite; }

        .hint-chips { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
        .hint-chip { font-size: 0.75rem; color: #7c6af7; background: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 99px; padding: 4px 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .hint-chip:hover { background: #EDE9FE; border-color: #7c6af7; }

        .req-badge { font-size: 0.68rem; color: #DC2626; font-weight: 600; background: #FEF2F2; border: 1px solid #FECACA; padding: 2px 8px; border-radius: 99px; margin-left: 6px; }
      `}</style>

      {/* Nav */}
      <nav style={{ background: "white", borderBottom: "1px solid #E8E6E0", padding: "14px 24px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.5" fill="white" fillOpacity="0.7"/></svg>
            </div>
            <span style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>AcadPortal</span>
            <span style={{ color: "#E8E6E0", margin: "0 4px" }}>·</span>
            <span style={{ fontSize: "0.8rem", color: "#888", fontWeight: 500 }}>Book Appointment</span>
          </div>
          <button className="ba-nav-btn" onClick={() => navigate("/student")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Heading */}
        <div>
          <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.15em", color: "#7c6af7", textTransform: "uppercase", marginBottom: 4 }}>Student Portal</p>
          <h1 style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "2rem", color: "#1a1a2e", letterSpacing: "-0.03em", marginBottom: 4 }}>Book Appointment</h1>
          <p style={{ fontSize: "0.9rem", color: "#888", lineHeight: 1.6 }}>Select a lecturer and time slot to schedule your session.</p>
        </div>

        {/* AI buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button className="btn-ai" onClick={aiRecommendLecturer} disabled={loadingAI}>
            {loadingAI ? (
              <><svg className="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#DDD6FE" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round"/></svg> Loading…</>
            ) : <>✨ AI Recommend Lecturer</>}
          </button>
          <button className="btn-ai" onClick={aiRecommendSlot} disabled={loadingAI}>
            🕐 AI Recommend Time Slot
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "11px 14px", color: "#DC2626", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 9 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/></svg>
            {error}
          </div>
        )}

        {/* AI recommended lecturer card */}
        {recommendedLecturer && (() => {
          const full = lecturers.find(l => l._id === recommendedLecturer.lecturerId);
          return (
            <div className="ai-panel">
              <button onClick={clearAI} style={{ position: "absolute", top: 14, right: 14, background: "white", border: "1px solid #E8E6E0", color: "#888", width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13 }}>✕</button>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "white", border: "1px solid #DDD6FE", padding: "4px 12px", borderRadius: 99, marginBottom: 16 }}>
                <span className="ai-dot"></span>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#7c3aed", letterSpacing: "0.12em" }}>AI RECOMMENDED LECTURER</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
                <div style={{ width: 60, height: 60, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "1.4rem", color: "white", flexShrink: 0 }}>
                  {(full?.firstname?.[0] || recommendedLecturer.name?.[0] || "?")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "1.1rem", color: "#1a1a2e", marginBottom: 6 }}>
                    {full ? `${full.firstname} ${full.lastname}` : recommendedLecturer.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= Math.round(recommendedLecturer.rating) ? "#f59e0b" : "#E8E6E0", fontSize: 15 }}>★</span>)}
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#7c3aed" }}>{Number(recommendedLecturer.rating).toFixed(1)}/5</span>
                    <span style={{ fontSize: "0.7rem", background: "#F5F3FF", border: "1px solid #DDD6FE", color: "#7c3aed", padding: "2px 9px", borderRadius: 99, fontWeight: 600 }}>Top Rated</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                    {full?.email && <div><div style={{ fontSize: "0.68rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Email</div><div style={{ fontSize: "0.85rem", color: "#555" }}>{full.email}</div></div>}
                    {full?.department && <div><div style={{ fontSize: "0.68rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Department</div><div style={{ fontSize: "0.85rem", color: "#555" }}>{full.department}</div></div>}
                    {recommendedLecturer.totalReviews !== undefined && <div><div style={{ fontSize: "0.68rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Reviews</div><div style={{ fontSize: "0.85rem", color: "#555" }}>{recommendedLecturer.totalReviews}</div></div>}
                  </div>
                  {recommendedLecturer.reason && (
                    <div style={{ marginTop: 12, background: "white", border: "1px solid #DDD6FE", borderRadius: 10, padding: "10px 12px", fontSize: "0.85rem", color: "#7c3aed", lineHeight: 1.65 }}>
                      <span style={{ fontSize: "0.7rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>Why recommended</span>
                      {recommendedLecturer.reason}
                    </div>
                  )}
                </div>
              </div>
              {slots.length > 0 && (
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#15803D", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "8px 14px" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" stroke="#15803D" strokeWidth="2"/><path d="M8 12l3 3 5-5" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {slots.length} available slots loaded — scroll down to pick one
                </div>
              )}
            </div>
          );
        })()}

        {/* AI recommended slots */}
        {recommendedSlots.length > 0 && (
          <div className="ai-panel">
            <button onClick={clearAI} style={{ position: "absolute", top: 14, right: 14, background: "white", border: "1px solid #E8E6E0", color: "#888", width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13 }}>✕</button>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "white", border: "1px solid #DDD6FE", padding: "4px 12px", borderRadius: 99, marginBottom: 16 }}>
              <span className="ai-dot"></span>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#7c3aed", letterSpacing: "0.12em" }}>AI RECOMMENDED SLOTS</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10 }}>
              {recommendedSlots.map((slot, i) => {
                const confNum = parseFloat(slot.confidenceScore) || 0;
                const confPct = confNum <= 1 ? confNum * 100 : confNum;
                return (
                  <button key={i} className="ai-slot-card"
                    onClick={() => { setSelectedLecturer(recommendedLecturer?.lecturerId || selectedLecturer); setSelectedSlot(slot.time); setBookingErrors(p => ({ ...p, slot: "" })); }}>
                    <div style={{ fontSize: "0.68rem", color: "#7c3aed", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Option {i + 1}</div>
                    <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "0.95rem" }}>{slot.time}</div>
                    <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 3 }}>{slot.day}</div>
                    <div className="conf-bar-bg"><div className="conf-bar-fill" style={{ width: `${confPct}%` }}></div></div>
                    <div style={{ fontSize: "0.7rem", color: "#7c3aed", marginTop: 4, fontWeight: 500 }}>Confidence: {slot.confidenceScore}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Select Lecturer */}
        <div className={`section-card${bookingErrors.lecturer ? " has-error" : ""}`}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>👨‍🏫</div>
            <div>
              <div style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>Select Lecturer</div>
              <div style={{ fontSize: "0.75rem", color: "#888", marginTop: 1 }}>Choose who you'd like to meet</div>
            </div>
          </div>
          <select value={selectedLecturer} onChange={e => loadSlots(e.target.value)} className={`ba-select${bookingErrors.lecturer ? " select-error" : ""}`}>
            <option value="">Choose a lecturer…</option>
            {lecturers.map(l => <option key={l._id} value={l._id}>{l.firstname} {l.lastname}</option>)}
          </select>
          {bookingErrors.lecturer && (
            <div className="field-error">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/></svg>
              {bookingErrors.lecturer}
            </div>
          )}
        </div>

        {/* Time Slots */}
        <div className={`section-card${bookingErrors.slot ? " has-error" : ""}`}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📅</div>
            <div>
              <div style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>Available Time Slots</div>
              <div style={{ fontSize: "0.75rem", color: "#888", marginTop: 1 }}>Click a slot to select it</div>
            </div>
          </div>
          {loadingSlots ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#888", padding: "20px 0" }}>
              <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E8E6E0" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="#7c6af7" strokeWidth="3" strokeLinecap="round"/></svg>
              Loading available slots…
            </div>
          ) : slots.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: "2rem", marginBottom: 10 }}>🗓️</div>
              <p style={{ fontSize: "0.9rem", color: "#888" }}>{selectedLecturer ? "No slots available for this lecturer." : "Select a lecturer to view their slots."}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 10 }}>
              {slots.map(slot => (
                <button key={slot._id} className={`slot-card${selectedSlot === slot._id ? " selected" : ""}`}
                  onClick={() => { setSelectedSlot(slot._id); setBookingErrors(p => ({ ...p, slot: "" })); }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, color: selectedSlot === slot._id ? "#7c6af7" : "#999" }}>
                    {selectedSlot === slot._id ? "✓ Selected" : "Available"}
                  </div>
                  <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: "0.9rem" }}>{slot.day}</div>
                  <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 3 }}>{slot.date}</div>
                  <div style={{ fontSize: "0.8rem", color: "#555", marginTop: 3, fontFamily: "monospace" }}>{slot.startTime} – {slot.endTime}</div>
                </button>
              ))}
            </div>
          )}
          {bookingErrors.slot && (
            <div className="field-error" style={{ marginTop: 12 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/></svg>
              {bookingErrors.slot}
            </div>
          )}
        </div>

        {/* Purpose of Meeting */}
        <div className={`section-card${messageError ? " has-error" : messageOk ? " is-valid" : ""}`}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEFCE8", border: "1px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>💬</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>Purpose of Meeting</span>
                <span className="req-badge">Required</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#888", marginTop: 1 }}>Briefly describe why you're booking this session</div>
            </div>
            {messageTouched && (
              messageOk
                ? <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#DCFCE7", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                : <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FEF2F2", border: "1px solid #FECACA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  </div>
            )}
          </div>

          <textarea
            value={message}
            onChange={e => {
              const val = e.target.value;
              if (val.length <= MAX_MESSAGE) {
                setMessage(val);
                if (messageTouched) setBookingErrors(p => ({ ...p, message: validateMessage(val) }));
              }
            }}
            onBlur={() => {
              setMessageTouched(true);
              setBookingErrors(p => ({ ...p, message: validateMessage(message) }));
            }}
            rows={4}
            placeholder="e.g. Discuss assignment feedback, clarify project requirements, get guidance on exam preparation..."
            className={`ba-textarea${messageError ? " textarea-error" : messageOk ? " textarea-valid" : ""}`}
          />

          <div className="char-bar-bg">
            <div style={{ height: "100%", borderRadius: 99, background: barColor, width: `${charPct}%`, transition: "width 0.2s, background 0.2s" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, flexWrap: "wrap", gap: 8 }}>
            <div>
              {messageError
                ? <div className="field-error" style={{ marginTop: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/></svg>
                    {messageError}
                  </div>
                : messageOk
                  ? <div className="field-success">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" stroke="#16A34A" strokeWidth="2"/><path d="M8 12l3 3 5-5" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Looks good!
                    </div>
                  : !messageTouched
                    ? <div style={{ fontSize: "0.75rem", color: "#aaa" }}>Minimum {MIN_MESSAGE} characters required</div>
                    : null
              }
            </div>
            <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: message.length > MAX_MESSAGE ? "#DC2626" : message.length >= MIN_MESSAGE ? "#16A34A" : "#aaa", fontWeight: 500 }}>
              {message.length} / {MAX_MESSAGE}
            </div>
          </div>

          {message.length === 0 && (
            <div>
              <div style={{ fontSize: "0.72rem", color: "#bbb", marginTop: 12, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Quick fill</div>
              <div className="hint-chips">
                {[
                  "Discuss assignment feedback",
                  "Project guidance & review",
                  "Exam preparation help",
                  "Clarify lecture content",
                  "Research topic discussion",
                ].map(chip => (
                  <button key={chip} className="hint-chip"
                    onClick={() => { setMessage(chip); setMessageTouched(true); setBookingErrors(p => ({ ...p, message: validateMessage(chip) })); }}>
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Book button */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 16 }}>
          <button className="btn-book" onClick={bookAppointment}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="white" strokeWidth="2" strokeLinecap="round"/><path d="M8 14l2.5 2.5L16 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}
