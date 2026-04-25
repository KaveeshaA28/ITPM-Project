// components/AvailabilityModal.jsx
import { useState } from "react";
import API from "../services/api";

const DURATIONS = [
  { label: "15 minutes", value: 15  },
  { label: "30 minutes", value: 30  },
  { label: "45 minutes", value: 45  },
  { label: "1 hour",     value: 60  },
  { label: "1.5 hours",  value: 90  },
  { label: "2 hours",    value: 120 },
];

const AvailabilityModal = ({ closeModal }) => {
  const [date, setDate]                 = useState("");
  const [startTime, setStartTime]       = useState("");
  const [endTime, setEndTime]           = useState("");
  const [slotDuration, setSlotDuration] = useState(30);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState(null); // { totalSlots, slots }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      setError("Please fill in all fields.");
      return;
    }
    if (startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }
    setError("");
    try {
      setLoading(true);
      const res = await API.post("/availability/create", {
        date, startTime, endTime, slotDuration,
      });
      setSuccess(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add availability.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate slot count preview
  const slotCount = (() => {
    if (!startTime || !endTime || startTime >= endTime) return 0;
    const diff = new Date(`1970-01-01T${endTime}:00`) - new Date(`1970-01-01T${startTime}:00`);
    return Math.floor(diff / (slotDuration * 60000));
  })();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .av-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(2,6,23,0.78); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .av-box {
          font-family: 'Sora', sans-serif; background: #0f172a;
          border: 1px solid rgba(255,255,255,0.09); border-radius: 24px; padding: 36px;
          width: 100%; max-width: 480px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
          position: relative;
        }
        .av-close {
          position: absolute; top: 16px; right: 16px;
          width: 30px; height: 30px; border-radius: 9px; cursor: pointer;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
          color: #64748b; font-size: 0.85rem;
          display: flex; align-items: center; justify-content: center; transition: all 0.18s ease;
        }
        .av-close:hover { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.3); color: #f87171; }

        .av-label {
          font-size: 0.72rem; color: #475569; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; display: block;
        }
        .av-input, .av-select {
          width: 100%; padding: 11px 14px; border-radius: 12px; outline: none;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          color: #e2e8f0; font-family: 'Sora', sans-serif; font-size: 0.875rem;
          transition: all 0.2s ease; box-sizing: border-box;
        }
        .av-input:focus, .av-select:focus {
          border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
          background: rgba(255,255,255,0.07);
        }
        .av-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%23475569' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center;
        }
        .av-select option { background: #0f172a; color: #e2e8f0; }
        .av-input[type="date"]::-webkit-calendar-picker-indicator,
        .av-input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }

        .av-time-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .av-preview {
          background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.15);
          border-radius: 12px; padding: 11px 14px;
          font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #475569;
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .av-preview-val { color: #60a5fa; font-weight: 600; }

        .av-error {
          display: flex; align-items: center; gap: 8px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.22);
          border-radius: 10px; padding: 10px 14px; color: #fca5a5; font-size: 0.82rem;
        }

        .btn-av-cancel {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          color: #94a3b8; font-family: 'Sora', sans-serif; font-weight: 500; font-size: 0.875rem;
          padding: 11px 20px; border-radius: 12px; cursor: pointer; transition: all 0.2s ease; flex: 1;
        }
        .btn-av-cancel:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }

        .btn-av-submit {
          background: linear-gradient(135deg,#3b82f6,#1d4ed8); box-shadow: 0 4px 16px rgba(59,130,246,0.3);
          color: white; font-weight: 700; border: none; cursor: pointer;
          border-radius: 12px; font-family: 'Sora', sans-serif; font-size: 0.875rem;
          padding: 11px 24px; transition: all 0.2s ease; flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-av-submit:hover:not(:disabled) { background: linear-gradient(135deg,#60a5fa,#3b82f6); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(59,130,246,0.45); }
        .btn-av-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-av-done {
          width: 100%; background: linear-gradient(135deg,#22c55e,#16a34a);
          box-shadow: 0 4px 16px rgba(34,197,94,0.3); color: white; font-weight: 700;
          border: none; cursor: pointer; border-radius: 12px;
          font-family: 'Sora', sans-serif; font-size: 0.9rem; padding: 13px; transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .btn-av-done:hover { background: linear-gradient(135deg,#4ade80,#22c55e); box-shadow: 0 6px 24px rgba(34,197,94,0.45); }

        .slot-list { max-height: 180px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #1e293b transparent; }
        .slot-list::-webkit-scrollbar { width: 4px; }
        .slot-list::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }

        .av-spinner { animation: avspin 0.8s linear infinite; }
        @keyframes avspin { to { transform: rotate(360deg); } }

        .grad-text { background: linear-gradient(90deg,#60a5fa,#a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .grad-green { background: linear-gradient(90deg,#4ade80,#22c55e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>

      <div className="av-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
        <div className="av-box">
          <button className="av-close" onClick={closeModal}>✕</button>

          {/* ── SUCCESS STATE ── */}
          {success ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#4ade80" strokeWidth="2"/>
                  <path d="M8 12l3 3 5-5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: '#22c55e', letterSpacing: '0.16em', marginBottom: '6px' }}>SUCCESS</p>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '8px' }}>
                Slots <span className="grad-green">Created!</span>
              </h2>
              <p style={{ color: '#475569', fontSize: '0.875rem', marginBottom: '20px' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#4ade80', fontWeight: 700, fontSize: '1.2rem' }}>
                  {success.totalSlots}
                </span>{' '}
                slot{success.totalSlots !== 1 ? 's' : ''} created for students to book.
              </p>

              {/* Slot list */}
              {success.slots?.length > 0 && (
                <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '4px 0', marginBottom: '24px', textAlign: 'left' }}>
                  <div className="slot-list">
                    {success.slots.map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 16px', borderBottom: i < success.slots.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.73rem', color: '#475569' }}>{s.day}</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.73rem', color: '#60a5fa', fontWeight: 600 }}>
                          {s.startTime} – {s.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn-av-done" onClick={closeModal}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Done
              </button>
            </div>

          ) : (
            /* ── FORM STATE ── */
            <>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#60a5fa" strokeWidth="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: '#3b82f6', letterSpacing: '0.16em', marginBottom: '4px' }}>LECTURER PORTAL</p>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>
                  Add <span className="grad-text">Availability</span>
                </h2>
                <p style={{ color: '#475569', fontSize: '0.82rem', marginTop: '6px' }}>Set a window — slots are auto-split by duration.</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* Date */}
                <div>
                  <label className="av-label">Date</label>
                  <input
                    type="date" value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="av-input"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {/* Start / End Time */}
                <div className="av-time-row">
                  <div>
                    <label className="av-label">Start Time</label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="av-input" />
                  </div>
                  <div>
                    <label className="av-label">End Time</label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="av-input" />
                  </div>
                </div>

                {/* Slot Duration */}
                <div>
                  <label className="av-label">Slot Duration</label>
                  <select value={slotDuration} onChange={(e) => setSlotDuration(Number(e.target.value))} className="av-select">
                    {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>

                {/* Live preview */}
                {date && startTime && endTime && startTime < endTime && slotCount > 0 && (
                  <div className="av-preview">
                    <span>📅</span>
                    <span>{new Date(date + 'T00:00:00').toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                    <span style={{ color: '#334155' }}>·</span>
                    <span className="av-preview-val">{startTime} – {endTime}</span>
                    <span style={{ color: '#334155' }}>·</span>
                    <span className="av-preview-val">{slotCount} slot{slotCount !== 1 ? 's' : ''}</span>
                    <span>× {slotDuration} min</span>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="av-error">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="2"/>
                      <path d="M12 8v4M12 16h.01" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button type="button" className="btn-av-cancel" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn-av-submit" disabled={loading}>
                    {loading ? (
                      <>
                        <svg className="av-spinner" width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                          <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Create Slots
                      </>
                    )}
                  </button>
                </div>

              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AvailabilityModal;