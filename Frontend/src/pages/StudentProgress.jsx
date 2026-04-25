import { useEffect, useState } from "react";
import API from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";

/* Custom dark tooltip for recharts — must be outside the parent component */
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', padding: '12px 16px', fontFamily: 'Sora, sans-serif', fontSize: '0.8rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <p style={{ color: '#94a3b8', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, marginBottom: '4px' }}>
          <span style={{ color: '#64748b' }}>{p.name}: </span>{p.value}
        </p>
      ))}
    </div>
  );
};

const StudentProgress = () => {
  const [appointments, setAppointments] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ completed: 0, cancelled: 0, pending: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const res = await API.get("/appointments/student");
        setAppointments(res.data);

        const completed = res.data.filter(a => a.status === "completed").length;
        const cancelled = res.data.filter(a => a.status === "cancelled").length;
        const pending   = res.data.filter(a => a.status === "approved" || a.status === "pending").length;
        setSummary({ completed, cancelled, pending });

        const dataMap = {};
        res.data.forEach((app) => {
          const date = new Date(app.date).toLocaleDateString();
          if (!dataMap[date]) dataMap[date] = { date, completed: 0, cancelled: 0, pending: 0 };
          if (app.status === "completed") dataMap[date].completed += 1;
          else if (app.status === "cancelled") dataMap[date].cancelled += 1;
          else if (app.status === "approved" || app.status === "pending") dataMap[date].pending += 1;
        });
        setChartData(Object.values(dataMap));
      } catch (error) {
        console.log("Error loading appointments:", error);
      }
    };
    loadAppointments();
  }, []);

  const statusConfig = {
    approved:  { bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)",  color: "#60a5fa",  dot: "#3b82f6"  },
    completed: { bg: "rgba(34,197,94,0.10)",   border: "rgba(34,197,94,0.3)",   color: "#4ade80",  dot: "#22c55e"  },
    cancelled: { bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.3)",   color: "#f87171",  dot: "#ef4444"  },
    pending:   { bg: "rgba(234,179,8,0.10)",   border: "rgba(234,179,8,0.3)",   color: "#facc15",  dot: "#eab308"  },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        .sp-root { font-family: 'Sora', sans-serif; background: #020617; min-height: 100vh; color: #e2e8f0; }
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

        /* Summary cards */
        .summary-card {
          flex: 1; min-width: 150px; border-radius: 20px; padding: 28px 24px;
          text-align: center; transition: all 0.25s ease;
        }
        .summary-card:hover { transform: translateY(-3px); }

        /* Chart cards */
        .chart-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 28px;
          transition: all 0.25s ease;
        }
        .chart-card:hover { border-color: rgba(59,130,246,0.2); }

        /* Table */
        .dark-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .dark-table thead tr {
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .dark-table th {
          padding: 14px 18px; text-align: left;
          font-size: 0.72rem; color: #475569;
          text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;
        }
        .dark-table td {
          padding: 14px 18px; color: #94a3b8;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          vertical-align: middle;
        }
        .dark-table tbody tr { transition: background 0.15s; }
        .dark-table tbody tr:hover { background: rgba(59,130,246,0.04); }
        .dark-table tbody tr:last-child td { border-bottom: none; }

        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 99px;
          font-size: 0.72rem; font-weight: 600;
        }

        .btn-ghost {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          color: #94a3b8; font-family: 'Sora', sans-serif; font-weight: 500; font-size: 0.85rem;
          padding: 10px 20px; border-radius: 12px; cursor: pointer;
          transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.18); color: #e2e8f0; }

        .section-line { flex:1; height:1px; background: rgba(255,255,255,0.06); }
        .section-title { font-size:1.05rem; font-weight:700; color:#f1f5f9; display:flex; align-items:center; gap:10px; }

        .table-wrap {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; overflow: hidden;
        }
        .table-scroll { overflow-x: auto; }
        .table-scroll::-webkit-scrollbar { height: 4px; }
        .table-scroll::-webkit-scrollbar-track { background: transparent; }
        .table-scroll::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 99px; }

        .site-footer {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 28px 0; text-align: center;
          font-size: 0.78rem; color: #1e293b;
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      <div className="sp-root">
        <div className="grid-bg"></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <p className="mono" style={{ fontSize: '0.7rem', color: '#3b82f6', letterSpacing: '0.15em', marginBottom: '4px' }}>STUDENT PORTAL</p>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2 }}>
                Appointment <span className="grad-text">Progress</span>
              </h1>
            </div>
            <button className="btn-ghost" onClick={() => navigate("/student-history")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to History
            </button>
          </div>

          {/* ── Summary Cards ── */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {[
              { label: 'Completed', value: summary.completed, icon: '🎓', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',  vColor: '#4ade80', lColor: '#22c55e' },
              { label: 'Cancelled', value: summary.cancelled, icon: '❌', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  vColor: '#f87171', lColor: '#ef4444' },
              { label: 'Pending',   value: summary.pending,   icon: '⏳', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', vColor: '#60a5fa', lColor: '#3b82f6' },
            ].map(({ label, value, icon, bg, border, vColor, lColor }) => (
              <div key={label} className="summary-card" style={{ background: bg, border: `1px solid ${border}` }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: vColor }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: lColor, marginTop: '4px', fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── Charts ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>

            {/* Bar Chart */}
            <div className="chart-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>📊</div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>Status Breakdown</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>Bar chart by date</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#334155', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#64748b', paddingTop: '12px' }} />
                  <Bar dataKey="completed" fill="#22c55e" name="Completed" radius={[4,4,0,0]} />
                  <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" radius={[4,4,0,0]} />
                  <Bar dataKey="pending"   fill="#3b82f6" name="Pending"   radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="chart-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>📈</div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>Appointment Trend</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>Line chart over time</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#334155', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.78rem', color: '#64748b', paddingTop: '12px' }} />
                  <Line type="monotone" dataKey="completed" stroke="#22c55e" name="Completed" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="cancelled" stroke="#ef4444" name="Cancelled" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="pending"   stroke="#3b82f6" name="Pending"   strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Table ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <span className="section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#3b82f6" strokeWidth="2"/>
                  <path d="M3 9h18M3 15h18M9 3v18" stroke="#3b82f6" strokeWidth="2"/>
                </svg>
                Summary Table
              </span>
              <div className="section-line"></div>
              <span className="mono" style={{ fontSize: '0.75rem', color: '#334155', flexShrink: 0 }}>{appointments.length} rows</span>
            </div>

            <div className="table-wrap">
              <div className="table-scroll">
                <table className="dark-table">
                  <thead>
                    <tr>
                      <th>Lecturer</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#334155' }}>No appointments found</td>
                      </tr>
                    ) : appointments.map((app) => {
                      const sc = statusConfig[app.status] || statusConfig.pending;
                      return (
                        <tr key={app._id}>
                          <td style={{ color: '#e2e8f0', fontWeight: 500 }}>
                            {app.lecturer?.firstname} {app.lecturer?.lastname}
                          </td>
                          <td className="mono" style={{ fontSize: '0.8rem' }}>
                            {new Date(app.date).toLocaleDateString()}
                          </td>
                          <td className="mono" style={{ fontSize: '0.8rem' }}>
                            {app.startTime} – {app.endTime}
                          </td>
                          <td>
                            <span className="badge" style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sc.dot, display: 'inline-block' }}></span>
                              {app.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: app.cancelReason ? '#f87171' : '#334155' }}>
                            {app.cancelReason || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className="site-footer">
            © {new Date().getFullYear()} AcadPortal · Student Appointment System
          </footer>
        </div>
      </div>
    </>
  );
};

export default StudentProgress;