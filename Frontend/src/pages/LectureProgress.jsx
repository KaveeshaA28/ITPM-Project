import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

const PIE_COLORS = ["#22c55e", "#ef4444"];

/* ── Custom dark tooltips — defined outside component to avoid render warnings ── */
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', padding: '12px 16px', fontFamily: 'Sora, sans-serif', fontSize: '0.8rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      {label && <p style={{ color: '#94a3b8', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem' }}>{label}</p>}
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || p.fill || '#60a5fa', marginBottom: '4px' }}>
          <span style={{ color: '#64748b' }}>{p.name ?? p.dataKey}: </span>{p.value}
        </p>
      ))}
    </div>
  );
};

const LectureProgress = () => {
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/dashboard/lecturer");
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const pieData = [
    { name: "Completed", value: stats.completed || 0 },
    { name: "Cancelled", value: stats.cancelled || 0 },
  ];

  const barData = [
    { status: "Pending",   count: stats.pending   || 0 },
    { status: "Approved",  count: stats.approved  || 0 },
    { status: "Completed", count: stats.completed || 0 },
    { status: "Cancelled", count: stats.cancelled || 0 },
  ];

  const BAR_COLORS = { Pending: "#eab308", Approved: "#3b82f6", Completed: "#22c55e", Cancelled: "#ef4444" };

  const lineData = stats.ratingsHistory || [
    { month: "Jan", rating: 4   },
    { month: "Feb", rating: 4.5 },
    { month: "Mar", rating: 4.2 },
    { month: "Apr", rating: 4.8 },
  ];

  const statItems = [
    { label: "Total",     value: stats.totalAppointments || 0,                     icon: "📋", color: "#60a5fa", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"  },
    { label: "Approved",  value: stats.approved  || 0,                             icon: "✅", color: "#60a5fa", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"  },
    { label: "Completed", value: stats.completed || 0,                             icon: "🎓", color: "#4ade80", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)"   },
    { label: "Cancelled", value: stats.cancelled || 0,                             icon: "❌", color: "#f87171", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   },
    { label: "Avg Rating",value: Number(stats.averageRating || 0).toFixed(1),      icon: "⭐", color: "#fbbf24", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .lp-root { font-family: 'Sora', sans-serif; background: #020617; min-height: 100vh; color: #e2e8f0; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        .grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .grad-text {
          background: linear-gradient(90deg,#60a5fa,#a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        .chart-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 28px;
          transition: border-color 0.25s ease;
        }
        .chart-card:hover { border-color: rgba(59,130,246,0.2); }

        .chart-header {
          display: flex; align-items: center; gap: 10px; margin-bottom: 24px;
        }
        .chart-icon {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 15px;
        }

        .stat-card {
          border-radius: 16px; padding: 20px 16px; text-align: center;
          transition: all 0.25s ease;
        }
        .stat-card:hover { transform: translateY(-3px); }

        .btn-ghost {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          color: #94a3b8; font-family: 'Sora', sans-serif; font-weight: 500; font-size: 0.85rem;
          padding: 10px 18px; border-radius: 12px; cursor: pointer;
          transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); color: #e2e8f0; }

        .section-line { flex:1; height:1px; background: rgba(255,255,255,0.06); }
        .section-title { font-size:1.05rem; font-weight:700; color:#f1f5f9; display:flex; align-items:center; gap:10px; }

        /* Recharts legend text */
        .recharts-legend-item-text { color: #64748b !important; font-size: 0.78rem !important; }
      `}</style>

      <div className="lp-root">
        <div className="grid-bg"></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <p className="mono" style={{ fontSize: '0.7rem', color: '#3b82f6', letterSpacing: '0.15em', marginBottom: '4px' }}>LECTURER PORTAL</p>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>
                Lecture <span className="grad-text">Progress</span>
              </h1>
            </div>
            <button className="btn-ghost" onClick={() => navigate("/lecturer")}>
              <ArrowLeftIcon style={{ width: '14px', height: '14px' }} />
              Back to Dashboard
            </button>
          </div>

          {/* ── Summary Stats ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {statItems.map(({ label, value, icon, color, bg, border }) => (
              <div key={label} className="stat-card" style={{ background: bg, border: `1px solid ${border}` }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '3px', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── Charts Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>

            {/* Pie Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-icon" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>🥧</div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>Completed vs Cancelled</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>Outcome distribution</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={45} paddingAngle={4} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: 'rgba(255,255,255,0.15)' }}>
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-icon" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>📊</div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>Appointment Status</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>Counts by status</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="status" tick={{ fill: '#334155', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Bar dataKey="count" name="Count" radius={[6,6,0,0]}>
                    {barData.map((entry) => (
                      <Cell key={entry.status} fill={BAR_COLORS[entry.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Line Chart — full width */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-icon" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>📈</div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>Average Rating Over Time</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>Monthly rating trend</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#334155', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ fontSize: '0.78rem', paddingTop: '12px' }} />
                <Line
                  type="monotone" dataKey="rating" name="Avg Rating"
                  stroke="#fbbf24" strokeWidth={2.5}
                  dot={{ r: 5, fill: '#fbbf24', strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </>
  );
};

export default LectureProgress;