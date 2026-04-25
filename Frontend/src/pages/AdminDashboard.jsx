import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// ─── Your color palette ─────────────────────────────────────────────────────
const P = {
  black: "#060a10", dark: "#0a0f1a", navy: "#0d1526", navyLight: "#111e35",
  border: "#1a2a45", blue: "#1d6cf2", blueBright: "#3b82f6", blueGlow: "#60a5fa",
  blueDark: "#1048b8", text: "#e8f0fe", muted: "#6b8ab5", card: "#0e1928",
};

// ─── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent, trend }) => (
  <div
    className="relative overflow-hidden rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border"
    style={{
      background: `linear-gradient(135deg, ${P.card} 0%, ${P.navyLight} 100%)`,
      borderColor: P.border,
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    }}
  >
    <div className="flex items-center justify-between">
      <span
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}
      >
        {icon}
      </span>
      {trend !== undefined && (
        <span
          className="text-xs font-bold px-2 py-1 rounded-full"
          style={{
            background: trend >= 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            color: trend >= 0 ? "#4ade80" : "#f87171",
            border: `1px solid ${trend >= 0 ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="text-3xl font-black" style={{ color: P.text }}>
        {value.toLocaleString()}
      </p>
      <p className="text-sm font-medium mt-0.5" style={{ color: P.muted }}>
        {label}
      </p>
    </div>
  </div>
);

// ─── Admin Profile Edit Modal ─────────────────────────────────────────────
const EditProfileModal = ({ admin, onClose, onSave }) => {
  const [form, setForm] = useState({ ...admin });
  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border"
        style={{ background: P.navy, borderColor: P.border }}
      >
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: `linear-gradient(90deg, ${P.blueDark}, ${P.blue})` }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">✏️</span>
            <h2 className="text-white font-bold text-lg">Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition text-xl"
          >×</button>
        </div>

        <div className="p-6 space-y-4">
          {[
            ["Full Name", "name", "text"],
            ["Email", "email", "email"],
            ["Phone", "phone", "tel"],
            ["Department", "department", "text"],
          ].map(([label, key, type]) => (
            <div key={key}>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wider" style={{ color: P.muted }}>
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={change(key)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition"
                style={{ background: P.dark, border: `1px solid ${P.border}`, color: P.text }}
                onFocus={(e) => (e.target.style.borderColor = P.blue)}
                onBlur={(e) => (e.target.style.borderColor = P.border)}
              />
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition"
            style={{ border: `1px solid ${P.border}`, color: P.muted, background: "transparent" }}
          >Cancel</button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition hover:opacity-90"
            style={{ background: `linear-gradient(90deg, ${P.blueDark}, ${P.blue})`, color: "#fff" }}
          >Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);

  const ADMIN = {
    name: "Dr. Sarah Mitchell",
    role: "System Administrator",
    email: "sarah.mitchell@university.edu",
    phone: "+1 (555) 234-5678",
    department: "Academic Affairs",
    joined: "January 2021",
    avatar: null,
  };
  const [admin, setAdmin] = useState(ADMIN);
  const [activeNav, setActiveNav] = useState("dashboard");

  const initials = admin.name.split(" ").slice(0, 2).map((w) => w[0]).join("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get("/admin/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = [
    { label: "Total Students",       value: analytics.totalStudents         || 0, icon: "🎓", trend: 12,  accent: "#3b82f6" },
    { label: "Total Lecturers",      value: analytics.totalLecturers        || 0, icon: "👨‍🏫", trend: 4,   accent: "#06b6d4" },
    { label: "Total Appointments",   value: analytics.totalAppointments     || 0, icon: "📅", trend: 8,   accent: "#818cf8" },
    { label: "Completed",            value: analytics.completedAppointments || 0, icon: "✅", trend: 15,  accent: "#4ade80" },
    { label: "Cancelled",            value: analytics.cancelledAppointments || 0, icon: "❌", trend: -3,  accent: "#f87171" },
    { label: "Total Feedback",       value: analytics.totalFeedbacks        || 0, icon: "💬", trend: 21,  accent: "#f59e0b" },
  ];

  // ─── NAV ITEMS ───────────────────────────────────────────────────────────
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⊞", path: "/admin" },
    { id: "students",  label: "Students",  icon: "🎓", path: "/admin/students" },
    { id: "lecturers", label: "Lecturers", icon: "👨‍🏫", path: "/admin/Lecture" },
    { id: "appointments", label: "Appointments", icon: "📅", path: "/admin/appointments" },
    { id: "feedback", label: "Feedback", icon: "💬", path: "/admin/feedback" },
    { id: "settings", label: "Settings", icon: "⚙️", path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: P.black }}>

      {/* ────────── SIDEBAR ────────── */}
      <aside
        className="w-64 min-h-screen flex flex-col border-r"
        style={{ background: `linear-gradient(180deg, ${P.dark} 0%, ${P.navy} 100%)`, borderColor: P.border }}
      >
        <div className="px-6 py-6 border-b" style={{ borderColor: P.border }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white"
              style={{ background: `linear-gradient(135deg, ${P.blueDark}, ${P.blue})`, boxShadow: `0 4px 14px ${P.blue}55` }}
            >A</div>
            <div>
              <p className="font-bold text-sm" style={{ color: P.text }}>AdminPortal</p>
              <p className="text-xs" style={{ color: P.muted }}>University System</p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="px-4 py-5 border-b" style={{ borderColor: P.border }}>
          <div className="rounded-2xl p-4 flex flex-col items-center gap-3 border" style={{ background: P.navyLight, borderColor: P.border }}>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ background: `linear-gradient(135deg, ${P.blueDark}, ${P.blueBright})`, boxShadow: `0 0 20px ${P.blue}55` }}
            >{initials}</div>
            <p className="font-bold text-sm" style={{ color: P.text }}>{admin.name}</p>
            <p className="text-xs mt-0.5" style={{ color: P.blueGlow }}>{admin.role}</p>
            <p className="text-xs mt-0.5" style={{ color: P.muted }}>{admin.department}</p>
            <button
              onClick={() => setEditOpen(true)}
              className="w-full py-2 rounded-xl text-xs font-bold transition hover:opacity-90"
              style={{ background: `linear-gradient(90deg, ${P.blueDark}, ${P.blue})`, color: "#fff", boxShadow: `0 2px 12px ${P.blue}44` }}
            >✏️ Edit Profile</button>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveNav(item.id); navigate(item.path); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={
                activeNav === item.id
                  ? { background: `linear-gradient(90deg, ${P.blueDark}cc, ${P.blue}99)`, color: "#fff", boxShadow: `0 0 16px ${P.blue}33`, border: `1px solid ${P.blue}55` }
                  : { color: P.muted, background: "transparent", border: "1px solid transparent" }
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ────────── MAIN CONTENT ────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="px-8 py-4 flex items-center justify-between border-b" style={{ background: P.dark, borderColor: P.border }}>
          <h1 className="text-xl font-black" style={{ color: P.text }}>
            {navItems.find((n) => n.id === activeNav)?.label || "Dashboard"}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6" style={{ background: P.black }}>
          {loading ? (
            <p className="text-white">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {stats.map((s) => <StatCard key={s.label} {...s} />)}
            </div>
          )}
        </div>
      </main>

      {editOpen && <EditProfileModal admin={admin} onClose={() => setEditOpen(false)} onSave={(updated) => setAdmin(updated)} />}
    </div>
  );
};

export default AdminDashboard;