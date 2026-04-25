import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email.trim());

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "password") {
      v = value.slice(0, 8);
      setPasswordError(v.length > 0 && v.length !== 8 ? "Password must be exactly 8 characters" : "");
    }
    setFormData((p) => ({ ...p, [name]: v }));
    if (name === "email") {
      setEmailError(!value.trim() ? "Email is required" : !validateEmail(value) ? "Please enter a valid Gmail address" : "");
    }
  };

  const handleLogin = async (e) => { 
    e.preventDefault();
    setError("");
    if (!formData.email.trim()) return setEmailError("Email is required");
    if (!validateEmail(formData.email)) return setEmailError("Please enter a valid Gmail address");
    if (formData.password.length !== 8) return setPasswordError("Password must be exactly 8 characters");

    try {
      setLoading(true);
      const res = await API.post("/auth/login", formData);
      login(res.data);
      setFormData({ email: "", password: "" });

      // ── Redirect based on role ──────────────────────────────
      const role = res.data.user.role;
      if (role === "admin")    navigate("/admin");
      else if (role === "lecturer") navigate("/lecturer");
      else                          navigate("/student");
      // ────────────────────────────────────────────────────────

    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
      setFormData((p) => ({ ...p, password: "" }));
    } finally {
      setLoading(false);
    }
  };

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
        .side-feat { display: flex; gap: 12px; align-items: flex-start; }
        .side-feat-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(124,106,247,0.12); color: #7c6af7; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>

      <div style={{ width: "100%", maxWidth: 960, display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: 24, overflow: "hidden", boxShadow: "0 32px 80px rgba(26,26,46,0.15), 0 0 0 1px #E8E6E0" }} className="auth-grid">
        <style>{`.auth-grid{grid-template-columns:1fr 1fr}@media(max-width:680px){.auth-grid{grid-template-columns:1fr!important}.auth-side{display:none!important}}`}</style>

        {/* Form side */}
        <div style={{ background: "white", padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 36 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/><circle cx="12" cy="12" r="2.5" fill="white" fillOpacity="0.7"/></svg>
            </div>
            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "1rem", color: "#1a1a2e" }}>AcadPortal</span>
          </div>

          <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: "2rem", color: "#1a1a2e", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 6 }}>
            Welcome back.
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#888", marginBottom: 28 }}>Sign in to your academic dashboard.</p>

          {error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "11px 14px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/></svg>
              <span style={{ fontSize: "0.85rem", color: "#dc2626" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div className="field-wrap">
                <span className="icon-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.8"/></svg>
                </span>
                <input type="email" name="email" placeholder="Gmail address" value={formData.email} onChange={handleChange}
                  onBlur={() => setEmailError(!formData.email.trim() ? "Email is required" : !validateEmail(formData.email) ? "Please enter a valid Gmail address" : "")}
                  className={`auth-input${emailError ? " error" : ""}`} required autoComplete="new-email" />
              </div>
              {emailError && <p className="err-msg">{emailError}</p>}
            </div>

            <div>
              <div className="field-wrap">
                <span className="icon-wrap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </span>
                <input type="password" name="password" placeholder="Password (8 characters)" value={formData.password} onChange={handleChange}
                  onBlur={() => setPasswordError(formData.password.length !== 8 ? "Password must be exactly 8 characters" : "")}
                  className={`auth-input${passwordError ? " error" : ""}`} required maxLength={8} autoComplete="new-password" />
              </div>
              {passwordError && <p className="err-msg">{passwordError}</p>}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 2 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.85rem", color: "#666", userSelect: "none" }}>
                <input type="checkbox" style={{ accentColor: "#7c6af7", width: 14, height: 14 }} />
                Remember me
              </label>
              <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#7c6af7", cursor: "pointer" }}>Forgot password?</span>
            </div>

            <button type="submit" disabled={loading || !!emailError || !!passwordError} className="auth-btn" style={{ marginTop: 6 }}>
              {loading ? (
                <>
                  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
                  Signing in…
                </>
              ) : (
                <>Sign In <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#999", marginTop: 28 }}>
            No account yet?{" "}
            <span onClick={() => navigate("/register")} style={{ color: "#7c6af7", fontWeight: 600, cursor: "pointer" }}>Create one free</span>
          </p>
        </div>

        {/* Side panel */}
        <div className="auth-side" style={{ background: "#1a1a2e", padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,106,247,0.25) 0%, transparent 70%)", top: -150, right: -100, pointerEvents: "none" }}></div>
          <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)", bottom: -100, left: -80, pointerEvents: "none" }}></div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,106,247,0.15)", border: "1px solid rgba(124,106,247,0.3)", padding: "6px 14px", borderRadius: 99 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c6af7", display: "inline-block", animation: "blink 2s infinite" }}></span>
              <span style={{ fontSize: "0.72rem", color: "#a78bfa", fontWeight: 500, letterSpacing: "0.1em" }}>ACADPORTAL</span>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontStyle: "italic", fontSize: "2.2rem", color: "white", lineHeight: 1.15, marginBottom: 14, letterSpacing: "-0.02em" }}>
              Your academic schedule, simplified.
            </h2>
            <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.75, marginBottom: 36 }}>
              Book appointments, track progress, and collaborate with your institution — all in one place.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { icon: "📅", title: "Smart scheduling",        desc: "See live availability and book in one click" },
                { icon: "📊", title: "Progress insights",       desc: "Track your academic journey in real time"   },
                { icon: "🔔", title: "Instant notifications",   desc: "Never miss a confirmation or change"        },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="side-feat">
                  <div className="side-feat-icon" style={{ fontSize: 16 }}>{icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.9)", fontSize: "0.88rem" }}>{title}</div>
                    <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, position: "relative", zIndex: 1 }}>
            {[["12K+", "Students"], ["480+", "Lecturers"], ["99.9%", "Uptime"]].map(([val, lbl]) => (
              <div key={lbl} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: "1.4rem", color: "white" }}>{val}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
