import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const navLinks = [
    { to: "/",           label: "Home"        },
    { to: "/lecturers",  label: "Lecturers"   },
    { to: "/departments",label: "Departments" },
    { to: "/contact",    label: "Contact Us"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .nav-root {
          font-family: 'Sora', sans-serif;
          position: sticky; top: 0; z-index: 100; width: 100%;
          background: rgba(2,6,23,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .nav-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 24px; height: 64px;
        }

        /* Logo */
        .nav-logo {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .nav-logo-icon {
          width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg,#3b82f6,#1d4ed8);
          box-shadow: 0 4px 14px rgba(59,130,246,0.4);
          display: flex; align-items: center; justify-content: center;
        }
        .nav-logo-text {
          font-size: 1.1rem; font-weight: 800; letter-spacing: -0.02em;
          color: #f1f5f9;
        }

        /* Links */
        .nav-links {
          display: flex; align-items: center; gap: 4px;
          list-style: none; margin: 0; padding: 0;
        }
        .nav-link {
          font-size: 0.875rem; font-weight: 500; text-decoration: none;
          color: #64748b; padding: 8px 14px; border-radius: 10px;
          transition: all 0.18s ease; position: relative;
        }
        .nav-link:hover { color: #e2e8f0; background: rgba(255,255,255,0.06); }
        .nav-link.active {
          color: #f1f5f9; background: rgba(59,130,246,0.12);
          border: 1px solid rgba(59,130,246,0.22);
        }

        /* Right side CTAs */
        .nav-cta {
          display: flex; align-items: center; gap: 10px;
        }
        .btn-nav-ghost {
          font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 600;
          padding: 8px 16px; border-radius: 10px; cursor: pointer;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          color: #94a3b8; text-decoration: none;
          transition: all 0.18s ease; display: inline-flex; align-items: center;
        }
        .btn-nav-ghost:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
        .btn-nav-primary {
          font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 600;
          padding: 8px 18px; border-radius: 10px; cursor: pointer;
          background: linear-gradient(135deg,#3b82f6,#1d4ed8);
          box-shadow: 0 3px 12px rgba(59,130,246,0.3);
          color: white; text-decoration: none; border: none;
          transition: all 0.18s ease; display: inline-flex; align-items: center;
        }
        .btn-nav-primary:hover { background: linear-gradient(135deg,#60a5fa,#3b82f6); box-shadow: 0 4px 18px rgba(59,130,246,0.45); transform: translateY(-1px); }
      `}</style>

      <nav className="nav-root">
        <div className="nav-inner">

          {/* ── Logo ── */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L4 7.5V16.5L12 21L20 16.5V7.5L12 3Z" stroke="white" strokeWidth="2.2" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.6"/>
              </svg>
            </div>
            <span className="nav-logo-text">AcadPortal</span>
          </Link>

          {/* ── Nav Links ── */}
          <ul className="nav-links">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`nav-link ${location.pathname === to ? "active" : ""}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Auth Buttons ── */}
          <div className="nav-cta">
            <Link to="/login"    className="btn-nav-ghost">Sign In</Link>
            <Link to="/register" className="btn-nav-primary">Get Started</Link>
          </div>

        </div>
      </nav>
    </>
  );
};

export default Header;