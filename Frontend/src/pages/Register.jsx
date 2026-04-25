import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email.trim());

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState({ firstname: "", lastname: "", email: "", password: "", role: "student", department: "" });

  const filled = Object.entries(formData).filter(([k, v]) => k !== "role" && v !== "").length;
  const progress = Math.min(100, Math.round((filled / 5) * 100));

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "firstname" || name === "lastname") v = value.replace(/[0-9]/g, "");
    if (name === "password") {
      v = value.slice(0, 8);
      setPasswordError(v.length > 0 && v.length !== 8 ? "Password must be exactly 8 characters" : "");
    }
    if (name === "email") setEmailError(!value.trim() ? "Email is required" : !validateEmail(value) ? "Please enter a valid Gmail address" : "");
    setFormData((p) => ({ ...p, [name]: v }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email.trim()) return setEmailError("Email is required");
    if (!validateEmail(formData.email)) return setEmailError("Please enter a valid Gmail address");
    if (!formData.firstname || !formData.lastname || !formData.password) return setError("Please fill all required fields");
    if (formData.password.length !== 8) return setPasswordError("Password must be exactly 8 characters");
    try {
      setLoading(true);
      await API.post("/auth/register", formData);
      setFormData({ firstname: "", lastname: "", email: "", password: "", role: "student", department: "" });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "student",  label: "Student",  icon: "🎓", desc: "Book appointments with lecturers" },
    { value: "lecturer", label: "Lecturer", icon: "👨‍🏫", desc: "Manage schedule & student sessions" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: "100vh", background: "#F8F7F4", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; }
        .auth-input {
          width: 100%; padding: 13px 16px 13px 44px;
          background: white; border: 1.5px solid #E8E6E0;
          border-radius: 12px; outline: none; color: #1a1a2e;
          font-family: 'DM Sans', sans-serif; font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        .auth-input::placeholder { color: #bbb; }
        .auth-input:focus { border-color: #7c6af7; box-shadow: 0 0 0 3px rgba(124,106,247,0.12); }
        .auth-input.error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.1); }
        .auth-btn {
          width: 100%; padding: 14px; border-radius: 12px;
          background: #1a1a2e; color: white; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 0.95rem;
          transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .auth-btn:hover:not(:disabled) { background: #2d2d4e; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .icon-wrap { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #bbb; pointer-events: none; }
        .field-wrap { position: relative; }
        .err-msg { font-size: 0.78rem; color: #ef4444; margin-top: 5px; padding-left: 2px; }
        .step-row { display: flex; gap: 14px; align-items: flex-start; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .step-row:last-child { border-bottom: none; }
        .step-num { width: 30px; height: 30px; border-radius: 50%; background: rgba(124,106,247,0.15); border: 1px solid rgba(124,106,247,0.3); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; color: #a78bfa; flex-shrink: 0; }
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}

        /* Role selector cards */
        .role-card {
          flex: 1; padding: 14px 12px; border-radius: 12px; cursor: pointer;
          border: 1.5px solid #E8E6E0; background: white;
          transition: all 0.18s ease; text-align: center;
          font-family: 'DM Sans', sans-serif;
        }
        .role-card:hover { border-color: #7c6af7; background: #F5F3FF; }
        .role-card.selected {
          border-color: #7c6af7; background: #F0EEFF;
          box-shadow: 0 0 0 3px rgba(124,106,247,0.12);
        }
        .role-icon { font-size: 1.5rem; margin-bottom: 6px; }
        .role-label { font-size: 0.88rem; font-weight: 700; color: #1a1a2e; }
        .role-desc { font-size: 0.72rem; color: #888; margin-top: 2px; line-height: 1.4; }
        .role-check {
          width: 18px; height: 18px; border-radius: 50%;
          background: #7c6af7; display: flex; align-items: center; justify-content: center;
          margin: 8px auto 0;
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 960, display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 80px rgba(26,26,46,0.15), 0 0 0 1px #E8E6E0" }} className="rg-grid">
        <style>{`.rg-grid{grid-template-columns:1fr 1fr}@media(max-width:680px){.rg-grid{grid-template-columns:1fr!important}.rg-side{display:none!important}}`}</style>

        {/* ── Form side ── */}
        <div style={{ background: "white", padding: "44px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.5" fill="white" fillOpacity="0.7"/></svg>
            </div>
            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "1rem", color: "#1a1a2e" }}>AcadPortal</span>
          </div>

          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: "1.9rem", color: "#1a1a2e", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 4 }}>Create your account.</h1>
          <p style={{ fontSize: "0.88rem", color: "#888", marginBottom: 20 }}>Fill in the details below to get started.</p>

          {/* Progress bar */}
          <div style={{ height: 4, background: "#F0EEF9", borderRadius: 99, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #7c6af7, #a78bfa)", width: `${progress}%`, transition: "width 0.3s ease" }}></div>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "11px 14px", marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: "0.85rem", color: "#dc2626" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["firstname", "First name"], ["lastname", "Last name"]].map(([n, ph]) => (
                <div className="field-wrap" key={n}>
                  <span className="icon-wrap">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </span>
                  <input type="text" name={n} placeholder={ph} value={formData[n]} onChange={handleChange} className="auth-input" required />
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <div className="field-wrap">
                <span className="icon-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.8"/></svg>
                </span>
                <input type="email" name="email" placeholder="Gmail address" value={formData.email} onChange={handleChange}
                  onBlur={() => setEmailError(!formData.email.trim() ? "Email is required" : !validateEmail(formData.email) ? "Please enter a valid Gmail address" : "")}
                  className={`auth-input${emailError ? " error" : ""}`} required autoComplete="new-email" />
              </div>
              {emailError && <p className="err-msg">{emailError}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="field-wrap">
                <span className="icon-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </span>
                <input type="password" name="password" placeholder="Password (exactly 8 characters)" value={formData.password} onChange={handleChange}
                  onBlur={() => setPasswordError(formData.password.length !== 8 ? "Password must be exactly 8 characters" : "")}
                  className={`auth-input${passwordError ? " error" : ""}`} required maxLength={8} autoComplete="new-password" />
              </div>
              {passwordError && <p className="err-msg">{passwordError}</p>}
            </div>

            {/* ── Role Selector (card style) ── */}
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>I am a</p>
              <div style={{ display: "flex", gap: 10 }}>
                {roles.map(({ value, label, icon, desc }) => (
                  <div
                    key={value}
                    className={`role-card ${formData.role === value ? "selected" : ""}`}
                    onClick={() => setFormData(p => ({ ...p, role: value }))}
                  >
                    <div className="role-icon">{icon}</div>
                    <div className="role-label">{label}</div>
                    <div className="role-desc">{desc}</div>
                    {formData.role === value && (
                      <div className="role-check">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Department */}
            <div className="field-wrap">
              <span className="icon-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 10v4M12 10v4M16 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <input type="text" name="department" placeholder="Department (optional)" value={formData.department} onChange={handleChange} className="auth-input" />
            </div>

            <button type="submit" disabled={loading || !!emailError || !!passwordError} className="auth-btn" style={{ marginTop: 4 }}>
              {loading ? (
                <>
                  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
                  Creating account…
                </>
              ) : (
                <>Create account <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#999", marginTop: 22 }}>
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} style={{ color: "#7c6af7", fontWeight: 600, cursor: "pointer" }}>Sign in</span>
          </p>
        </div>

        {/* ── Side panel ── */}
        <div className="rg-side" style={{ background: "#1a1a2e", padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,106,247,0.22) 0%, transparent 70%)", top: -140, right: -90, pointerEvents: "none" }}></div>
          <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,106,247,0.1) 0%, transparent 70%)", bottom: -80, left: -80, pointerEvents: "none" }}></div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,106,247,0.15)", border: "1px solid rgba(124,106,247,0.3)", padding: "6px 14px", borderRadius: 99 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c6af7", display: "inline-block", animation: "blink 2s infinite" }}></span>
              <span style={{ fontSize: "0.72rem", color: "#a78bfa", fontWeight: 500, letterSpacing: "0.1em" }}>JOIN ACADPORTAL</span>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontStyle: "italic", fontSize: "2.1rem", color: "white", lineHeight: 1.15, marginBottom: 12, letterSpacing: "-0.02em" }}>
              Join your academic<br />community.
            </h2>
            <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.75, marginBottom: 32 }}>
              Get access to the university's scheduling system in just a few steps.
            </p>
            <div>
              {[
                { num: "01", title: "Create your account", desc: "Fill in your details and select your role" },
                { num: "02", title: "Set up your profile",  desc: "Add your department and preferences" },
                { num: "03", title: "Start booking",        desc: "Schedule appointments with lecturers instantly" },
              ].map(({ num, title, desc }) => (
                <div key={num} className="step-row">
                  <div className="step-num">{num}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.85)", fontSize: "0.88rem" }}>{title}</div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, position: "relative", zIndex: 1 }}>
            {[["12K+", "Students"], ["480+", "Lecturers"], ["99.9%", "Uptime"]].map(([val, lbl]) => (
              <div key={lbl} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: "1.3rem", color: "white" }}>{val}</div>
                <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
