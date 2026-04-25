import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 14h2M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Instant Booking",
    desc: "Reserve time with your lecturer in seconds — no email chains, no confusion.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Live Availability",
    desc: "See real-time open slots. Lecturers update their schedule and you always see current hours.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Smart Reminders",
    desc: "Email notifications keep you on track — confirmations, updates, cancellations.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Progress Tracking",
    desc: "Students monitor academic progress. Lecturers gain insight on engagement and completion.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Feedback Loop",
    desc: "Post-appointment ratings help lecturers improve and students feel heard.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: "Role-Based Access",
    desc: "Separate secure dashboards for students and lecturers. Your data, your view.",
  },
];

const steps = [
  { num: "01", title: "Create your account", desc: "Register with your university email and select your role." },
  { num: "02", title: "Browse availability", desc: "Find lecturers and see their open appointment slots." },
  { num: "03", title: "Book & confirm", desc: "Pick a slot, submit your request, and get notified instantly." },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#F8F7F4", minHeight: "100vh", color: "#1a1a2e" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F8F7F4; }
        .hp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; transition: all 0.3s ease; }
        .hp-btn-primary {
          background: #1a1a2e; color: #F8F7F4;
          padding: 13px 28px; border-radius: 100px;
          border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600; letter-spacing: -0.01em;
          transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;
        }
        .hp-btn-primary:hover { background: #2d2d4e; transform: translateY(-1px); }
        .hp-btn-outline {
          background: transparent; color: #1a1a2e;
          padding: 13px 28px; border-radius: 100px;
          border: 1.5px solid #1a1a2e; cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem; font-weight: 600;
          transition: all 0.2s ease;
        }
        .hp-btn-outline:hover { background: #1a1a2e; color: #F8F7F4; transform: translateY(-1px); }
        .feature-card {
          background: white; border-radius: 20px; padding: 28px;
          border: 1px solid #E8E6E0;
          transition: all 0.25s ease;
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(26,26,46,0.08); border-color: #c5c0b8; }
        .step-item { display: flex; gap: 20px; align-items: flex-start; padding: 24px 0; border-bottom: 1px solid #E8E6E0; }
        .step-item:last-child { border-bottom: none; }
        .cta-card {
          background: #1a1a2e; border-radius: 28px; padding: 72px 48px;
          text-align: center; position: relative; overflow: hidden;
        }
        .cta-accent {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%);
          top: -150px; right: -80px; pointer-events: none;
        }
        .stat-pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: white; border: 1px solid #E8E6E0;
          padding: 8px 18px; border-radius: 100px;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.7s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
      `}</style>

      {/* Nav */}
      <nav className="hp-nav" style={{
        background: scrollY > 40 ? "rgba(248,247,244,0.95)" : "transparent",
        backdropFilter: scrollY > 40 ? "blur(12px)" : "none",
        borderBottom: scrollY > 40 ? "1px solid #E8E6E0" : "none",
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="2.5" fill="white" fillOpacity="0.7"/>
              </svg>
            </div>
            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "1.1rem", color: "#1a1a2e", letterSpacing: "-0.02em" }}>AcadPortal</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button className="hp-btn-outline" style={{ padding: "10px 22px", fontSize: "0.85rem" }} onClick={() => navigate("/login")}>Sign In</button>
            <button className="hp-btn-primary" style={{ padding: "10px 22px", fontSize: "0.85rem" }} onClick={() => navigate("/register")}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 130, paddingBottom: 100, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-up" style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div className="stat-pill">
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
              <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#555" }}>Live booking system</span>
            </div>
          </div>

          <h1 className="fade-up-2" style={{
            fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: "clamp(2.8rem, 6vw, 5rem)",
            lineHeight: 1.05, textAlign: "center", letterSpacing: "-0.03em",
            color: "#1a1a2e", marginBottom: 22,
          }}>
            Book your lecturer.<br />
            <span style={{ fontStyle: "italic", color: "#7c6af7" }}>Skip the chaos.</span>
          </h1>

          <p className="fade-up-3" style={{
            textAlign: "center", fontSize: "1.1rem", color: "#666",
            lineHeight: 1.75, maxWidth: 520, margin: "0 auto 40px",
          }}>
            AcadPortal connects students and lecturers through a clean, reliable appointment booking platform built for universities.
          </p>

          <div className="fade-up-3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
            <button className="hp-btn-primary" onClick={() => navigate("/register")}>
              Create free account
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="hp-btn-outline" onClick={() => navigate("/login")}>Sign in</button>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
            {[["12,000+", "Students enrolled"], ["480+", "Active lecturers"], ["99.9%", "System uptime"]].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: "2rem", color: "#1a1a2e", letterSpacing: "-0.03em" }}>{val}</div>
                <div style={{ fontSize: "0.82rem", color: "#888", marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mock UI strip */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ background: "#1a1a2e", borderRadius: 24, padding: "4px 4px 0", boxShadow: "0 40px 100px rgba(26,26,46,0.25)" }}>
            <div style={{ background: "#242436", borderRadius: "20px 20px 0 0", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block" }}/>)}
              <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 6, height: 22, marginLeft: 12, display: "flex", alignItems: "center", paddingLeft: 10 }}>
                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>acadportal.university.edu/student</span>
              </div>
            </div>
            {/* Dashboard preview */}
            <div style={{ background: "#0f0f1a", padding: "24px 28px", borderRadius: "0 0 20px 20px" }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                {[["Total", "8", "#60a5fa"], ["Approved", "3", "#4ade80"], ["Pending", "2", "#facc15"], ["Done", "3", "#a78bfa"]].map(([l, v, c]) => (
                  <div key={l} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: c }}>{v}</div>
                    <div style={{ fontSize: "0.68rem", color: "#475569", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
              {[
                { name: "Dr. Perera", date: "Mon Apr 7", time: "10:00 AM", status: "approved", sc: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", color: "#60a5fa" } },
                { name: "Prof. Silva", date: "Wed Apr 9", time: "2:30 PM",  status: "pending",  sc: { bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.3)",   color: "#facc15" } },
              ].map(({ name, date, time, status, sc }) => (
                <div key={name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(124,106,247,0.15)", border: "1px solid rgba(124,106,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa" }}>
                      {name.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e2e8f0" }}>{name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#475569" }}>{date} · {time}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "4px 10px", borderRadius: 99, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.15em", color: "#7c6af7", textTransform: "uppercase", marginBottom: 10 }}>Everything you need</p>
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: "2.6rem", color: "#1a1a2e", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Built for academic<br />scheduling.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="feature-card">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F0EEF9", color: "#7c6af7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  {icon}
                </div>
                <h3 style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "1.15rem", color: "#1a1a2e", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: "0.88rem", color: "#666", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 80, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 300px" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.15em", color: "#7c6af7", textTransform: "uppercase", marginBottom: 10 }}>Simple process</p>
            <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: "2.4rem", color: "#1a1a2e", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
              Up and running<br />in minutes.
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.75 }}>
              No training required. Students and lecturers can manage their entire appointment workflow within a few clicks.
            </p>
          </div>
          <div style={{ flex: "1 1 320px" }}>
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="step-item">
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#F0EEF9", border: "1px solid #d4cfed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.78rem", color: "#7c6af7" }}>{num}</div>
                <div>
                  <div style={{ fontWeight: 600, color: "#1a1a2e", marginBottom: 4, fontSize: "0.95rem" }}>{title}</div>
                  <div style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div className="cta-card">
            <div className="cta-accent"></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontStyle: "italic", fontSize: "clamp(2rem, 4vw, 3rem)", color: "white", letterSpacing: "-0.03em", marginBottom: 16, lineHeight: 1.1 }}>
                Ready to get started?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 36, fontSize: "1rem", lineHeight: 1.7, maxWidth: 440, margin: "0 auto 36px" }}>
                Join thousands of students and lecturers already using AcadPortal to manage their academic schedule.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => navigate("/register")} style={{ background: "white", color: "#1a1a2e", padding: "14px 32px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.9rem", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  Create free account
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={() => navigate("/login")} style={{ background: "rgba(255,255,255,0.08)", color: "white", padding: "14px 32px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.9rem", transition: "all 0.2s" }}>
                  Sign in
                </button>
              </div>
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem", marginTop: 24 }}>Free to use · No credit card · Secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #E8E6E0", padding: "28px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e" }}>AcadPortal</span>
          <span style={{ fontSize: "0.82rem", color: "#aaa" }}>© {new Date().getFullYear()} · University Appointment System</span>
        </div>
      </footer>
    </div>
  );
}
