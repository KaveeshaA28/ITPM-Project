import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .footer-root {
          font-family: 'Sora', sans-serif;
          background: #020617;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin-top: auto;
          position: relative; overflow: hidden;
        }

        .footer-orb {
          position: absolute; width: 500px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
          bottom: -100px; left: 50%; transform: translateX(-50%);
          pointer-events: none;
        }

        .footer-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 60px 24px 32px;
          position: relative; z-index: 1;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr 1fr 1fr;
          gap: 40px;
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr; }
        }

        .footer-col-title {
          font-size: 0.72rem; font-weight: 700; color: #3b82f6;
          letter-spacing: 0.14em; text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 16px; display: block;
        }

        .footer-brand-name {
          font-size: 1.15rem; font-weight: 800; color: #f1f5f9;
          letter-spacing: -0.01em; margin-bottom: 10px;
          display: flex; align-items: center; gap: 10px;
        }
        .footer-brand-icon {
          width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
          background: linear-gradient(135deg,#3b82f6,#1d4ed8);
          box-shadow: 0 3px 12px rgba(59,130,246,0.35);
          display: flex; align-items: center; justify-content: center;
        }

        .footer-desc {
          font-size: 0.85rem; color: #475569; line-height: 1.75; max-width: 260px;
        }

        .footer-link {
          display: block; font-size: 0.875rem; color: #475569;
          cursor: pointer; padding: 5px 0;
          transition: color 0.18s ease;
          text-decoration: none;
        }
        .footer-link:hover { color: #60a5fa; }

        .contact-row {
          display: flex; align-items: flex-start; gap: 10px; padding: 6px 0;
        }
        .contact-icon {
          width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.18);
          display: flex; align-items: center; justify-content: center; font-size: 12px;
        }
        .contact-text { font-size: 0.85rem; color: #475569; line-height: 1.5; }

        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          margin: 40px 0 24px;
        }

        .footer-bottom {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px;
        }
        .footer-copy {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem; color: #1e293b;
        }
        .footer-social {
          display: flex; gap: 10px;
        }
        .social-btn {
          width: 32px; height: 32px; border-radius: 9px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.18s ease; color: #334155;
        }
        .social-btn:hover {
          background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3);
          color: #60a5fa;
        }
      `}</style>

      <footer className="footer-root">
        <div className="footer-orb"></div>

        <div className="footer-inner">
          <div className="footer-grid">

            {/* ── Brand ── */}
            <div>
              <div className="footer-brand-name">
                <div className="footer-brand-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="white" strokeWidth="2.2" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.6"/>
                  </svg>
                </div>
                AcadPortal
              </div>
              <p className="footer-desc">
                A modern platform for students and lecturers to manage appointments, schedules, and academic sessions — easily and efficiently.
              </p>
            </div>

            {/* ── Quick Links ── */}
            <div>
              <span className="footer-col-title">Navigation</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { label: "Home",        path: "/"            },
                  { label: "Lecturers",   path: "/lecturers"   },
                  { label: "Departments", path: "/departments" },
                  { label: "Contact Us",  path: "/contact"     },
                ].map(({ label, path }) => (
                  <span key={path} className="footer-link" onClick={() => navigate(path)}>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Account ── */}
            <div>
              <span className="footer-col-title">Account</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { label: "Sign In",        path: "/login"    },
                  { label: "Register",       path: "/register" },
                  { label: "Student Portal", path: "/login"  },
                  { label: "Lecturer Portal",path: "/login" },
                ].map(({ label, path }) => (
                  <span key={path} className="footer-link" onClick={() => navigate(path)}>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Contact ── */}
            <div>
              <span className="footer-col-title">Contact</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div className="contact-row">
                  <div className="contact-icon">✉</div>
                  <div className="contact-text">support@acadportal.com</div>
                </div>
                <div className="contact-row">
                  <div className="contact-icon">📞</div>
                  <div className="contact-text">+94 71 234 5678</div>
                </div>
                <div className="contact-row">
                  <div className="contact-icon">📍</div>
                  <div className="contact-text">Colombo, Sri Lanka</div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Bottom bar ── */}
          <div className="footer-divider"></div>
          <div className="footer-bottom">
            <span className="footer-copy">
              © {new Date().getFullYear()} AcadPortal · All rights reserved
            </span>

            {/* Social icons */}
            <div className="footer-social">
              {/* GitHub */}
              <div className="social-btn" title="GitHub">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </div>
              {/* Twitter/X */}
              <div className="social-btn" title="Twitter">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
              {/* LinkedIn */}
              <div className="social-btn" title="LinkedIn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;