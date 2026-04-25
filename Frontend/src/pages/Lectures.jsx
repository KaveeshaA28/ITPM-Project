import React, { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ── Avatar color palette ── */
const PALETTE = [
  ["#6366f1", "#818cf8"],
  ["#0ea5e9", "#38bdf8"],
  ["#10b981", "#34d399"],
  ["#f59e0b", "#fbbf24"],
  ["#ec4899", "#f472b6"],
  ["#8b5cf6", "#a78bfa"],
];

const initials = (str = "") =>
  str
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "L";

/* ── SVG Donut ── */
const Donut = ({ value, total, color, size = 72 }) => {
  const r = 26,
    circ = 2 * Math.PI * r;
  const arc = total > 0 ? (value / total) * circ : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="5.5"
      />
      <circle
        cx="30"
        cy="30"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5.5"
        strokeDasharray={`${arc} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 30 30)"
        style={{ transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)" }}
      />
      <text
        x="30"
        y="35"
        textAnchor="middle"
        fill="white"
        fontSize="12"
        fontWeight="800"
        fontFamily="'Syne',sans-serif"
      >
        {value}
      </text>
    </svg>
  );
};

/* ── Stars ── */
const Stars = ({ rating = 0 }) => (
  <span style={{ display: "flex", gap: 3 }}>
    {Array.from({ length: 5 }, (_, i) => {
      const full = i < Math.floor(rating),
        half = !full && i < rating;
      return (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24">
          <defs>
            <linearGradient id={`sg${i}`}>
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.10)" />
            </linearGradient>
          </defs>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={
              full
                ? "#fbbf24"
                : half
                  ? `url(#sg${i})`
                  : "rgba(255,255,255,0.09)"
            }
          />
        </svg>
      );
    })}
  </span>
);

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
const Lectures = () => {
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchLecturers = async () => {
    try {
      const [lecturerRes] = await Promise.all([API.get("/auth/admin/lecturers")]);
      setLecturers(lecturerRes.data.data);
      console.log(lecturerRes.data)
    } catch (err) {
      setError("Failed to load lecturers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    if (modalOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [modalOpen]);

  const fetchStats = async (lecturerId) => {
    if (!lecturerId) {
      console.error("fetchStats: no lecturerId — check lecturer object shape");
      setStats({
        totalAppointments: 0,
        completed: 0,
        cancelled: 0,
        approved: 0,
        pending: 0,
        rating: 0,
        reviewCount: 0,
      });
      return;
    }
    setStatsLoading(true);
    setStats(null);
    try {
      // Calls GET /dashboard/lecturer/:id  (new backend route)
      const res = await API.get(`/dashboard/lecturer/${lecturerId}`);
      const d = res.data;

      setStats({
        totalAppointments: d.totalAppointments ?? 0,
        completed: d.completed ?? 0,
        approved: d.approved ?? 0,
        pending: d.pending ?? 0,
        cancelled: d.cancelled ?? 0,
        rating: parseFloat(d.averageRating) || 0,
        reviewCount: d.totalFeedbacks ?? 0,
      });
    } catch (err) {
      console.error("Stats fetch failed:", err);
      setStats({
        totalAppointments: 0,
        completed: 0,
        cancelled: 0,
        approved: 0,
        pending: 0,
        rating: 0,
        reviewCount: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const openModal = (lecturer) => {
    // MongoDB returns _id; some REST APIs map it to id — handle both
    const id = lecturer._id ?? lecturer.id;
    if (!id)
      console.warn("openModal: lecturer has no _id or id field", lecturer);
    setModal(lecturer);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
    fetchStats(id);
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "";
    setTimeout(() => {
      setModal(null);
      setStats(null);
    }, 320);
  };

const searchText = search.toLowerCase();

const filtered = lecturers.filter((l) => {
  const firstName = l.firstname || "";
  const lastName = l.lastname || "";
  const fullName = `${firstName} ${lastName}`.toLowerCase();

  return (
    firstName.toLowerCase().includes(searchText) ||
    lastName.toLowerCase().includes(searchText) ||
    fullName.includes(searchText) ||
    (l.department || "").toLowerCase().includes(searchText) ||
    (l.email || "").toLowerCase().includes(searchText) ||
    (l.role || "").toLowerCase().includes(searchText)
  );
});
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ══════════ ROOT ══════════ */
        .lp {
          min-height: 100vh;
          background: #05060f;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #e2e8f0;
          position: relative;
          overflow-x: hidden;
        }

        /* layered ambient background */
        .lp-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(ellipse 70% 55% at 8% 5%,  rgba(99,102,241,.13) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 92% 85%, rgba(16,185,129,.09) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 60% 50%, rgba(139,92,246,.05) 0%, transparent 50%);
        }

        /* subtle grid */
        .lp-grid-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(rgba(99,102,241,.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,.025) 1px, transparent 1px);
          background-size: 52px 52px;
        }

        /* ══════════ TOPBAR ══════════ */
        .lp-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.1rem 2.25rem;
          gap: 1rem;
          flex-wrap: wrap;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(5,6,15,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
          z-index: 8;
        }

        .lp-bar-left { display: flex; flex-direction: column; }
        .lp-eyebrow {
          font-size: .6rem;
          letter-spacing: .26em;
          text-transform: uppercase;
          color: #6366f1;
          font-weight: 700;
          margin-bottom: .15rem;
          display: flex;
          align-items: center;
          gap: .45rem;
        }
        .lp-eyebrow::before {
          content: '';
          display: inline-block;
          width: 14px;
          height: 1.5px;
          background: #6366f1;
          border-radius: 2px;
        }
        .lp-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -.04em;
          line-height: 1;
          background: linear-gradient(130deg, #f8fafc 30%, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-title em {
          font-style: normal;
          background: linear-gradient(120deg, #818cf8, #34d399 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* search */
        .lp-srch-wrap {
          display: flex;
          align-items: center;
          gap: .75rem;
          flex: 1;
          max-width: 360px;
          min-width: 180px;
        }
        .lp-srch { position: relative; flex: 1; }
        .lp-srch svg {
          position: absolute;
          left: .9rem;
          top: 50%;
          transform: translateY(-50%);
          opacity: .35;
          pointer-events: none;
          color: #818cf8;
        }
        .lp-srch input {
          width: 100%;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: .6rem 1rem .6rem 2.5rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: .82rem;
          color: #e2e8f0;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
        }
        .lp-srch input::placeholder { color: #2d3748; }
        .lp-srch input:focus {
          border-color: rgba(99,102,241,.45);
          background: rgba(99,102,241,.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,.08);
        }

        .lp-bar-right {
          display: flex;
          align-items: center;
          gap: .65rem;
        }
        .lp-count-badge {
          display: flex;
          align-items: center;
          gap: .5rem;
          font-size: .75rem;
          color: #334155;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: .38rem .8rem;
          white-space: nowrap;
        }
        .lp-count-badge b {
          color: #818cf8;
          font-family: 'Syne', sans-serif;
          font-size: .85rem;
        }

        /* ══════════ HERO SECTION ══════════ */
        .lp-hero {
          position: relative;
          z-index: 1;
          padding: 2.8rem 2.25rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .lp-hero-inner {
          max-width: 640px;
        }
        .lp-hero-sub {
          font-size: .82rem;
          color: #475569;
          line-height: 1.7;
          margin-top: .45rem;
        }

        /* stat row */
        .lp-stat-row {
          display: flex;
          gap: 1.8rem;
          margin-top: 1.6rem;
          flex-wrap: wrap;
        }
        .lp-stat-item { display: flex; flex-direction: column; gap: .2rem; }
        .lp-stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 1.55rem;
          font-weight: 800;
          letter-spacing: -.05em;
          background: linear-gradient(130deg, #f1f5f9, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }
        .lp-stat-lbl {
          font-size: .68rem;
          color: #334155;
          letter-spacing: .06em;
          text-transform: uppercase;
          font-weight: 600;
        }
        .lp-stat-divider {
          width: 1px;
          height: 32px;
          background: rgba(255,255,255,0.07);
          align-self: center;
        }

        /* ══════════ GRID ══════════ */
        .lp-grid-wrap {
          position: relative;
          z-index: 1;
          padding: 2rem 2.25rem 3rem;
        }
        .lp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }

        /* ══════════ CARD ══════════ */
        .lc {
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 1.4rem;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform .22s cubic-bezier(.4,0,.2,1),
                      border-color .22s,
                      box-shadow .22s,
                      background .22s;
          animation: lcFadeUp .5s ease both;
          user-select: none;
        }

        @keyframes lcFadeUp {
          from { opacity:0; transform:translateY(22px) scale(.98); }
          to   { opacity:1; transform:translateY(0)    scale(1);   }
        }
        .lc:nth-child(1){animation-delay:.04s} .lc:nth-child(2){animation-delay:.08s}
        .lc:nth-child(3){animation-delay:.12s} .lc:nth-child(4){animation-delay:.16s}
        .lc:nth-child(5){animation-delay:.20s} .lc:nth-child(6){animation-delay:.24s}
        .lc:nth-child(n+7){animation-delay:.28s}

        .lc:hover {
          transform: translateY(-6px) scale(1.012);
          border-color: rgba(99,102,241,.35);
          background: rgba(99,102,241,.04);
          box-shadow:
            0 24px 60px rgba(0,0,0,.55),
            0 0 0 1px rgba(99,102,241,.12),
            inset 0 1px 0 rgba(255,255,255,.06);
        }
        .lc:active { transform: scale(.983); }

        /* top shimmer accent */
        .lc-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 20px 20px 0 0;
          opacity: 0;
          transition: opacity .25s;
        }
        .lc:hover .lc-accent { opacity: 1; }

        /* card glow on hover */
        .lc-glow {
          position: absolute;
          top: -30px; left: 50%;
          transform: translateX(-50%);
          width: 120px; height: 80px;
          border-radius: 50%;
          filter: blur(30px);
          opacity: 0;
          transition: opacity .3s;
          pointer-events: none;
        }
        .lc:hover .lc-glow { opacity: .18; }

        .lc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .lc-av {
          width: 46px; height: 46px;
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: .95rem; font-weight: 800;
          color: #fff;
          letter-spacing: .02em;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,.3);
        }

        /* online indicator */
        .lc-indicator {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 8px rgba(52,211,153,.6);
          margin-top: 4px;
          flex-shrink: 0;
        }

        .lc-dept {
          font-family: 'Syne', sans-serif;
          font-size: .9rem; font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -.02em;
          margin-bottom: .28rem;
          line-height: 1.3;
        }
        .lc-email {
          font-size: .71rem; color: #3d4f66;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          margin-bottom: .9rem;
        }

        /* divider */
        .lc-div {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin-bottom: .85rem;
        }

        .lc-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: .5rem;
        }
        .lc-pill {
          font-size: .62rem; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          color: #34d399;
          background: rgba(52,211,153,.08);
          border: 1px solid rgba(52,211,153,.18);
          padding: .2rem .6rem;
          border-radius: 100px;
        }
        .lc-cta {
          display: flex; align-items: center; gap: .3rem;
          font-size: .68rem; font-weight: 600; color: #6366f1;
          opacity: 0; transform: translateX(-4px);
          transition: opacity .2s, transform .2s;
        }
        .lc:hover .lc-cta { opacity: 1; transform: translateX(0); }

        /* ══════════ LOADING / ERROR ══════════ */
        .lp-c {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 50vh; gap: 1.2rem;
        }
        .lp-loader {
          display: flex; gap: 6px;
        }
        .lp-loader span {
          width: 9px; height: 9px; border-radius: 50%;
          animation: ldr 1.4s ease-in-out infinite;
        }
        .lp-loader span:nth-child(1) { background: #6366f1; }
        .lp-loader span:nth-child(2) { background: #818cf8; animation-delay: .18s; }
        .lp-loader span:nth-child(3) { background: #34d399; animation-delay: .36s; }
        @keyframes ldr {
          0%,80%,100% { transform: scale(.55); opacity: .3; }
          40%          { transform: scale(1);   opacity: 1;  }
        }
        .lp-loader-text {
          font-size: .8rem; color: #334155; letter-spacing: .04em;
        }

        .lp-err {
          background: rgba(239,68,68,.06);
          border: 1px solid rgba(239,68,68,.18);
          border-radius: 18px; padding: 2rem 2.5rem;
          text-align: center; color: #fca5a5; max-width: 340px;
        }
        .lp-err-icon { font-size: 2rem; margin-bottom: .6rem; }

        /* ══════════ EMPTY STATE ══════════ */
        .lp-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 5rem 2rem;
          gap: .8rem;
          text-align: center;
        }
        .lp-empty-icon {
          width: 54px; height: 54px;
          border-radius: 16px;
          background: rgba(99,102,241,.07);
          border: 1px solid rgba(99,102,241,.14);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: .3rem;
          color: #6366f1;
        }
        .lp-empty h3 { font-size: .95rem; font-weight: 600; color: #475569; }
        .lp-empty p  { font-size: .8rem; color: #1e293b; }

        /* ══════════ MODAL ══════════ */
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 100;
          background: rgba(0,0,0,.78);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.25rem;
          opacity: 0; pointer-events: none;
          transition: opacity .3s ease;
        }
        .modal-backdrop.open { opacity: 1; pointer-events: all; }

        .modal {
          width: 100%; max-width: 610px; max-height: 90vh;
          overflow-y: auto;
          background: #0a0b18;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 26px;
          box-shadow:
            0 50px 120px rgba(0,0,0,.8),
            0 0 0 1px rgba(99,102,241,.10),
            inset 0 1px 0 rgba(255,255,255,.05);
          transform: translateY(28px) scale(.96);
          transition: transform .32s cubic-bezier(.34,1.2,.64,1);
          scrollbar-width: thin;
          scrollbar-color: rgba(99,102,241,.2) transparent;
          position: relative;
          overflow: hidden;
        }
        .modal-backdrop.open .modal {
          transform: translateY(0) scale(1);
        }

        /* modal top gradient */
        .modal-gradient {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 200px;
          pointer-events: none;
          z-index: 0;
          opacity: .12;
        }

        /* modal header */
        .mh {
          padding: 1.7rem 1.7rem 1.3rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative;
          z-index: 1;
        }
        .mh-close {
          position: absolute; top: 1.1rem; right: 1.1rem;
          width: 30px; height: 30px; border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          color: #94a3b8; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: .9rem;
          transition: background .2s, color .2s, border-color .2s;
        }
        .mh-close:hover {
          background: rgba(239,68,68,.12);
          color: #fca5a5;
          border-color: rgba(239,68,68,.25);
        }
        .mh-top {
          display: flex; align-items: center; gap: 1rem; margin-bottom: .8rem;
        }
        .mh-av {
          width: 58px; height: 58px; border-radius: 16px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 800; color: #fff;
          box-shadow: 0 8px 24px rgba(0,0,0,.4);
        }
        .mh-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.15rem; font-weight: 800;
          color: #f8fafc; letter-spacing: -.035em; margin-bottom: .18rem;
        }
        .mh-email { font-size: .75rem; color: #475569; margin-bottom: .45rem; }
        .mh-pills { display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
        .mh-pill {
          display: inline-flex; align-items: center; gap: .3rem;
          font-size: .62rem; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          color: #34d399;
          background: rgba(52,211,153,.08);
          border: 1px solid rgba(52,211,153,.2);
          padding: .2rem .65rem; border-radius: 100px;
        }
        .mh-pill-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 5px rgba(52,211,153,.6);
        }

        /* modal body */
        .mb {
          padding: 1.5rem 1.7rem 1.8rem;
          position: relative; z-index: 1;
        }
        .mb-sec {
          font-size: .6rem; letter-spacing: .22em;
          text-transform: uppercase; color: #2d3f55;
          font-weight: 700; margin-bottom: .9rem;
          display: flex; align-items: center; gap: .5rem;
        }
        .mb-sec::after {
          content: '';
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.04);
        }

        /* total card */
        .mb-total {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(99,102,241,.06);
          border: 1px solid rgba(99,102,241,.14);
          border-radius: 16px;
          padding: 1.1rem 1.3rem;
          margin-bottom: 1rem;
        }
        .mb-total-label { font-size: .75rem; color: #64748b; font-weight: 500; margin-bottom: .25rem; }
        .mb-total-val {
          font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 800;
          letter-spacing: -.07em; color: #818cf8; line-height: 1;
        }
        .mb-total-sub { font-size: .65rem; color: #2d3f55; margin-top: .3rem; }

        /* rings */
        .mb-rings {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: .8rem;
          margin-bottom: 1.5rem;
        }
        @media(max-width:480px) { .mb-rings { grid-template-columns: repeat(2,1fr); } }
        .mb-ring-cell {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: .9rem .6rem;
          display: flex; flex-direction: column; align-items: center; gap: .4rem;
          transition: background .2s, border-color .2s, transform .2s;
        }
        .mb-ring-cell:hover {
          background: rgba(255,255,255,.045);
          border-color: rgba(255,255,255,.1);
          transform: translateY(-2px);
        }
        .mb-ring-lbl {
          font-size: .65rem; font-weight: 700;
          color: #475569; text-align: center; letter-spacing: .04em;
          text-transform: uppercase;
        }

        /* status pills */
        .mb-pills { display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: 1.5rem; }
        .mb-status-pill {
          flex: 1; min-width: 120px;
          display: flex; align-items: center; gap: .7rem;
          border-radius: 14px; padding: .85rem 1rem;
          border: 1px solid;
          transition: transform .2s;
        }
        .mb-status-pill:hover { transform: translateY(-2px); }
        .mbsp-icon {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; flex-shrink: 0;
        }
        .mbsp-label { font-size: .67rem; color: #475569; font-weight: 600; letter-spacing:.03em; margin-bottom: .15rem; text-transform:uppercase; }
        .mbsp-val {
          font-family: 'Syne', sans-serif;
          font-size: 1.2rem; font-weight: 800;
          letter-spacing: -.04em; line-height: 1;
        }

        /* bars */
        .mb-bars { display: flex; flex-direction: column; gap: .8rem; margin-bottom: 1.5rem; }
        .mb-bar-row { display: flex; flex-direction: column; gap: .3rem; }
        .mb-bar-top {
          display: flex; justify-content: space-between;
          align-items: center; font-size: .73rem;
        }
        .mb-bar-name { color: #64748b; font-weight: 500; }
        .mb-bar-nums { font-weight: 700; }
        .mb-bar-track {
          height: 5px; border-radius: 100px;
          background: rgba(255,255,255,0.05); overflow: hidden;
        }
        .mb-bar-fill {
          height: 100%; border-radius: 100px;
          transition: width .9s cubic-bezier(.4,0,.2,1);
        }

        .mb-div { height: 1px; background: rgba(255,255,255,.05); margin: 1.3rem 0; }

        /* rating */
        .mb-rating {
          display: flex; align-items: center; gap: 1.2rem;
          background: rgba(251,191,36,.05);
          border: 1px solid rgba(251,191,36,.14);
          border-radius: 16px; padding: 1.2rem 1.4rem;
        }
        .mb-rat-num {
          font-family: 'Syne', sans-serif;
          font-size: 2.8rem; font-weight: 800;
          letter-spacing: -.08em; color: #fbbf24; line-height: 1; flex-shrink: 0;
        }
        .mb-rat-sub { font-size: .72rem; color: rgba(251,191,36,.4); margin-top: .3rem; }

        /* skeleton */
        .sk {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,.03) 25%,
            rgba(255,255,255,.07) 50%,
            rgba(255,255,255,.03) 75%
          );
          background-size: 200% 100%;
          animation: sksh 1.6s infinite;
          border-radius: 12px;
        }
        @keyframes sksh {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="lp">
        <div className="lp-bg" />
        <div className="lp-grid-bg" />

        <Navbar />

        {/* ── TOP BAR ── */}
        <div className="lp-bar">
          <div className="lp-bar-left">
            <span className="lp-eyebrow">Faculty Directory</span>
            <h1 className="lp-title">
              Meet Our <em>Lecturers</em>
            </h1>
          </div>

          <div className="lp-srch-wrap">
            <div className="lp-srch">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                placeholder="Search department, email, role…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="lp-bar-right">
            {!loading && !error && (
              <div className="lp-count-badge">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2.5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <b>{filtered.length}</b> of {lecturers.length}
              </div>
            )}
          </div>
        </div>

        {/* ── HERO ── */}
        {!loading && !error && (
          <div className="lp-hero">
            <div className="lp-hero-inner">
              <p className="lp-hero-sub">
                Browse faculty members, explore their departments, and view
                appointment statistics. Click any card to see detailed insights.
              </p>
              <div className="lp-stat-row">
                <div className="lp-stat-item">
                  <span className="lp-stat-val">{lecturers.length}</span>
                  <span className="lp-stat-lbl">Faculty members</span>
                </div>
                <div className="lp-stat-divider" />
                <div className="lp-stat-item">
                  <span className="lp-stat-val">
                    {[...new Set(lecturers.map((l) => l.department))].length}
                  </span>
                  <span className="lp-stat-lbl">Departments</span>
                </div>
                <div className="lp-stat-divider" />
                <div className="lp-stat-item">
                  <span className="lp-stat-val">{filtered.length}</span>
                  <span className="lp-stat-lbl">Showing now</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── GRID ── */}
        <div className="lp-grid-wrap">
          {loading && (
            <div className="lp-c">
              <div className="lp-loader">
                <span />
                <span />
                <span />
              </div>
              <p className="lp-loader-text">Loading faculty data…</p>
            </div>
          )}

          {error && (
            <div className="lp-c">
              <div className="lp-err">
                <div className="lp-err-icon">⚠️</div>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="lp-grid">
              {filtered.length === 0 ? (
                <div className="lp-empty">
                  <div className="lp-empty-icon">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <h3>No results found</h3>
                  <p>Try adjusting your search terms</p>
                </div>
              ) : (
                filtered.map((lecturer, i) => {
                  const [ca, cb] = PALETTE[i % PALETTE.length];
                  return (
                    <div
                      key={i}
                      className="lc"
                      onClick={() => openModal(lecturer)}
                    >
                      {/* top accent line */}
                      <div
                        className="lc-accent"
                        style={{
                          background: `linear-gradient(90deg,${ca},${cb})`,
                        }}
                      />
                      {/* hover glow */}
                      <div className="lc-glow" style={{ background: ca }} />

                      <div className="lc-header">
                        <div
                          className="lc-av"
                          style={{
                            background: `linear-gradient(135deg,${ca},${cb})`,
                          }}
                        >
                          {initials(lecturer.department)}
                        </div>
                        <div className="lc-indicator" />
                      </div>

                      <div className="lc-name">
                        {(lecturer.firstname || "") +
                          " " +
                          (lecturer.lastname || "")}
                      </div>
                      <div className="lc-dept">{lecturer.department}</div>
                      <div className="lc-email">{lecturer.email}</div>

                      <div className="lc-div" />
                      <div className="lc-foot">
                        <span className="lc-pill">{lecturer.role}</span>
                        <span className="lc-cta">
                          View stats
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* ════════════ MODAL ════════════ */}
      <div
        className={`modal-backdrop${modalOpen ? " open" : ""}`}
        onClick={(e) =>
          e.target.classList.contains("modal-backdrop") && closeModal()
        }
      >
        <div className="modal">
          {modal &&
            (() => {
              const idx = lecturers.findIndex((l) => l.email === modal.email);
              const [ca, cb] = PALETTE[idx % PALETTE.length];
              return (
                <>
                  {/* header gradient */}
                  <div
                    className="modal-gradient"
                    style={{
                      background: `linear-gradient(180deg,${ca}22 0%,transparent 100%)`,
                    }}
                  />

                  {/* Header */}
                  <div className="mh">
                    <button className="mh-close" onClick={closeModal}>
                      ✕
                    </button>
                    <div className="mh-top">
                      <div
                        className="mh-av"
                        style={{
                          background: `linear-gradient(135deg,${ca},${cb})`,
                        }}
                      >
                        {initials(modal.department)}
                      </div>
                      <div>
                        <div className="mh-name">{modal.department}</div>
                        <div className="mh-email">{modal.email}</div>
                        <div className="mh-pills">
                          <span className="mh-pill">
                            <span className="mh-pill-dot" />
                            {modal.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="mb">
                    {statsLoading ? (
                      <>
                        <div
                          className="sk"
                          style={{
                            height: 12,
                            width: "36%",
                            marginBottom: "1rem",
                          }}
                        />
                        <div
                          className="sk"
                          style={{
                            height: 78,
                            borderRadius: 16,
                            marginBottom: "1rem",
                          }}
                        />
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4,1fr)",
                            gap: ".8rem",
                            marginBottom: "1.4rem",
                          }}
                        >
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="sk"
                              style={{ height: 108, borderRadius: 14 }}
                            />
                          ))}
                        </div>
                        <div
                          className="sk"
                          style={{
                            height: 12,
                            width: "42%",
                            marginBottom: "1rem",
                          }}
                        />
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="sk"
                            style={{
                              height: 36,
                              borderRadius: 10,
                              marginBottom: ".8rem",
                            }}
                          />
                        ))}
                        <div
                          className="sk"
                          style={{
                            height: 86,
                            borderRadius: 16,
                            marginTop: "1.3rem",
                          }}
                        />
                      </>
                    ) : stats ? (
                      <>
                        {/* Total */}
                        <div className="mb-sec">Appointment Overview</div>
                        <div className="mb-total">
                          <div>
                            <div className="mb-total-label">
                              Total Appointments
                            </div>
                            <div className="mb-total-val">
                              {stats.totalAppointments ?? 0}
                            </div>
                            <div className="mb-total-sub">All time records</div>
                          </div>
                          <Donut
                            value={stats.totalAppointments ?? 0}
                            total={Math.max(stats.totalAppointments ?? 0, 1)}
                            color="#818cf8"
                            size={66}
                          />
                        </div>

                        {/* Rings */}
                        <div className="mb-rings">
                          {[
                            {
                              label: "Completed",
                              value: stats.completed ?? 0,
                              color: "#34d399",
                            },
                            {
                              label: "Approved",
                              value: stats.approved ?? 0,
                              color: "#60a5fa",
                            },
                            {
                              label: "Pending",
                              value: stats.pending ?? 0,
                              color: "#fbbf24",
                            },
                            {
                              label: "Cancelled",
                              value: stats.cancelled ?? 0,
                              color: "#f87171",
                            },
                          ].map(({ label, value, color }) => (
                            <div className="mb-ring-cell" key={label}>
                              <Donut
                                value={value}
                                total={stats.totalAppointments ?? 1}
                                color={color}
                                size={64}
                              />
                              <div className="mb-ring-lbl">{label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Status pills */}
                        <div className="mb-sec">Breakdown</div>
                        <div className="mb-pills">
                          {[
                            {
                              label: "Completed",
                              value: stats.completed ?? 0,
                              icon: "✅",
                              color: "#34d399",
                              bg: "rgba(52,211,153,.07)",
                              border: "rgba(52,211,153,.16)",
                            },
                            {
                              label: "Approved",
                              value: stats.approved ?? 0,
                              icon: "🔵",
                              color: "#60a5fa",
                              bg: "rgba(96,165,250,.07)",
                              border: "rgba(96,165,250,.16)",
                            },
                            {
                              label: "Pending",
                              value: stats.pending ?? 0,
                              icon: "⏳",
                              color: "#fbbf24",
                              bg: "rgba(251,191,36,.07)",
                              border: "rgba(251,191,36,.16)",
                            },
                            {
                              label: "Cancelled",
                              value: stats.cancelled ?? 0,
                              icon: "❌",
                              color: "#f87171",
                              bg: "rgba(248,113,113,.07)",
                              border: "rgba(248,113,113,.16)",
                            },
                          ].map(({ label, value, icon, color, bg, border }) => (
                            <div
                              key={label}
                              className="mb-status-pill"
                              style={{ background: bg, borderColor: border }}
                            >
                              <div
                                className="mbsp-icon"
                                style={{ background: `${color}18` }}
                              >
                                {icon}
                              </div>
                              <div>
                                <div className="mbsp-label">{label}</div>
                                <div className="mbsp-val" style={{ color }}>
                                  {value}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Bars */}
                        <div className="mb-sec">Distribution</div>
                        <div className="mb-bars">
                          {[
                            {
                              label: "Completed",
                              value: stats.completed ?? 0,
                              color: "#34d399",
                            },
                            {
                              label: "Approved",
                              value: stats.approved ?? 0,
                              color: "#60a5fa",
                            },
                            {
                              label: "Pending",
                              value: stats.pending ?? 0,
                              color: "#fbbf24",
                            },
                            {
                              label: "Cancelled",
                              value: stats.cancelled ?? 0,
                              color: "#f87171",
                            },
                          ].map(({ label, value, color }) => {
                            const pct =
                              stats.totalAppointments > 0
                                ? Math.round(
                                    (value / stats.totalAppointments) * 100,
                                  )
                                : 0;
                            return (
                              <div className="mb-bar-row" key={label}>
                                <div className="mb-bar-top">
                                  <span className="mb-bar-name">{label}</span>
                                  <span
                                    className="mb-bar-nums"
                                    style={{ color }}
                                  >
                                    {value}
                                    <span
                                      style={{
                                        color: "#2d3f55",
                                        fontWeight: 400,
                                      }}
                                    >
                                      {" "}
                                      ({pct}%)
                                    </span>
                                  </span>
                                </div>
                                <div className="mb-bar-track">
                                  <div
                                    className="mb-bar-fill"
                                    style={{
                                      width: `${pct}%`,
                                      background: color,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mb-div" />

                        {/* Rating */}
                        <div className="mb-sec">Rating & Reviews</div>
                        <div className="mb-rating">
                          <div className="mb-rat-num">
                            {(stats.rating ?? 0).toFixed(1)}
                          </div>
                          <div>
                            <Stars rating={stats.rating ?? 0} />
                            <div
                              className="mb-rat-sub"
                              style={{ marginTop: ".35rem" }}
                            >
                              {stats.reviewCount ?? 0} review
                              {(stats.reviewCount ?? 0) !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </>
              );
            })()}
        </div>
      </div>
    </>
  );
};

export default Lectures;
