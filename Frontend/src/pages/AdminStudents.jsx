import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const P = {
  black:      "#060a10",
  dark:       "#0a0f1a",
  navy:       "#0d1526",
  navyLight:  "#111e35",
  border:     "#1a2a45",
  blue:       "#1d6cf2",
  blueBright: "#3b82f6",
  blueGlow:   "#60a5fa",
  blueDark:   "#1048b8",
  text:       "#e8f0fe",
  muted:      "#6b8ab5",
  card:       "#0e1928",
};

const AdminStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState({}); // tracks per-student loading
  const PER_PAGE = 8;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/admin/students");
      setStudents(res.data.students);
    } catch (err) {
      console.error(err);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  // ── Action handlers ─────────────────────────────────────────────────────────
  const setStudentActionLoading = (id, action, val) =>
    setActionLoading((prev) => ({ ...prev, [`${id}_${action}`]: val }));

  const handleBlock = async (studentId) => {
    if (!window.confirm("Block this student?")) return;
    setStudentActionLoading(studentId, "block", true);
    try {
      await API.put(`/admin/users/${studentId}/block`);
      setStudents((prev) =>
        prev.map((s) => s._id === studentId ? { ...s, isBlocked: true } : s)
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to block student");
    } finally {
      setStudentActionLoading(studentId, "block", false);
    }
  };

  const handleUnblock = async (studentId) => {
    if (!window.confirm("Unblock this student?")) return;
    setStudentActionLoading(studentId, "unblock", true);
    try {
      await API.put(`/admin/users/${studentId}/unblock`);
      setStudents((prev) =>
        prev.map((s) => s._id === studentId ? { ...s, isBlocked: false } : s)
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to unblock student");
    } finally {
      setStudentActionLoading(studentId, "unblock", false);
    }
  };

  const handleSoftDelete = async (studentId) => {
    if (!window.confirm("Soft delete this student? They will be hidden but not permanently removed.")) return;
    setStudentActionLoading(studentId, "delete", true);
    try {
      await API.delete(`/admin/users/${studentId}/delete`);
      setStudents((prev) => prev.filter((s) => s._id !== studentId));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete student");
    } finally {
      setStudentActionLoading(studentId, "delete", false);
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const filtered = students.filter((s) => {
    const matchSearch =
      `${s.firstname} ${s.lastname} ${s.email} ${s.department}`
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active"  && !s.isBlocked) ||
      (filter === "blocked" &&  s.isBlocked);
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const counts = {
    all:     students.length,
    active:  students.filter((s) => !s.isBlocked).length,
    blocked: students.filter((s) =>  s.isBlocked).length,
  };

  const handleSearch = (v) => { setSearch(v); setCurrentPage(1); };
  const handleFilter = (v) => { setFilter(v); setCurrentPage(1); };

  const initials = (s) =>
    `${s.firstname?.[0] ?? ""}${s.lastname?.[0] ?? ""}`.toUpperCase();

  const avatarColors = [
    ["#1048b8","#3b82f6"],["#0e7490","#06b6d4"],["#5b21b6","#818cf8"],
    ["#065f46","#34d399"],["#92400e","#fbbf24"],["#9d174d","#f472b6"],
  ];
  const avatarGrad = (name) => {
    const i = (name?.charCodeAt(0) ?? 0) % avatarColors.length;
    return avatarColors[i];
  };

  // ── Reusable action button ──────────────────────────────────────────────────
  const ActionBtn = ({ onClick, disabled, label, color, bg, border, hoverBg }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: "4px 10px",
          borderRadius: "8px",
          fontSize: "11px",
          fontWeight: 700,
          border: `1px solid ${border}`,
          background: hovered && !disabled ? hoverBg : bg,
          color,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "all 0.15s ease",
          whiteSpace: "nowrap",
          letterSpacing: "0.02em",
        }}
      >
        {disabled ? "…" : label}
      </button>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: P.black }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 rounded-full animate-spin"
          style={{ borderColor: `${P.blue}33`, borderTopColor: P.blue }} />
        <p style={{ color: P.muted }}>Loading students…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: P.black }}>
      <div className="rounded-2xl p-8 text-center border max-w-sm"
        style={{ background: P.card, borderColor: "#7f1d1d55" }}>
        <span className="text-4xl">⚠️</span>
        <p className="font-semibold mt-3" style={{ color: "#f87171" }}>{error}</p>
        <button onClick={() => window.location.reload()}
          className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
          style={{ background: "#dc2626", color: "#fff" }}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-8 py-8"
      style={{ background: P.black, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 hover:-translate-x-0.5"
            style={{
              background: `linear-gradient(90deg, ${P.blueDark}, ${P.blue})`,
              borderColor: `${P.blue}55`, color: "#fff",
              boxShadow: `0 4px 14px ${P.blue}44`,
            }}
          >← Admin Dashboard</button>
          <div>
            <h1 className="text-2xl font-black" style={{ color: P.text }}>All Students</h1>
            <p className="text-sm mt-0.5" style={{ color: P.muted }}>Manage and monitor enrolled students</p>
          </div>
        </div>
        <div className="rounded-2xl px-5 py-3 border text-center"
          style={{
            background: `linear-gradient(135deg, ${P.blueDark}55, ${P.blue}33)`,
            borderColor: `${P.blue}44`, boxShadow: `0 4px 20px ${P.blue}22`,
          }}>
          <p className="text-2xl font-black" style={{ color: P.text }}>{students.length}</p>
          <p className="text-xs" style={{ color: P.blueGlow }}>Total Students</p>
        </div>
      </div>

      {/* ── Filter pills ── */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { key: "all",     label: "All",     color: P.blue,    bg: `${P.blue}22`,    border: `${P.blue}44`    },
          { key: "active",  label: "Active",  color: "#4ade80", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.3)" },
          { key: "blocked", label: "Blocked", color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
        ].map((f) => (
          <button key={f.key} onClick={() => handleFilter(f.key)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border"
            style={{
              background: filter === f.key ? f.bg : "transparent",
              borderColor: filter === f.key ? f.border : P.border,
              color: filter === f.key ? f.color : P.muted,
              boxShadow: filter === f.key ? `0 0 12px ${f.color}22` : "none",
            }}>
            {f.label}
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: filter === f.key ? f.border : P.navyLight, color: filter === f.key ? f.color : P.muted }}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: P.muted }}>🔍</span>
        <input type="text" placeholder="Search by name, email or department…"
          value={search} onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition"
          style={{ background: P.card, border: `1px solid ${P.border}`, color: P.text }}
          onFocus={(e) => (e.target.style.borderColor = P.blue)}
          onBlur={(e)  => (e.target.style.borderColor = P.border)} />
        {search && (
          <button onClick={() => handleSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-lg leading-none hover:opacity-70"
            style={{ color: P.muted }}>×</button>
        )}
      </div>

      {/* ── Table card ── */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: P.card, borderColor: P.border }}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ background: P.navyLight, borderBottom: `1px solid ${P.border}` }}>
                {["Student", "Email", "Department", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest"
                    style={{ color: P.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? (
                paginated.map((student, idx) => {
                  const [g1, g2] = avatarGrad(student.firstname);
                  const isBlocking  = actionLoading[`${student._id}_block`];
                  const isUnblocking = actionLoading[`${student._id}_unblock`];
                  const isDeleting  = actionLoading[`${student._id}_delete`];
                  const anyLoading  = isBlocking || isUnblocking || isDeleting;

                  return (
                    <tr key={student._id}
                      style={{ borderBottom: `1px solid ${P.border}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = P.navyLight)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>

                      {/* Name + avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${g1}, ${g2})`, boxShadow: `0 2px 8px ${g2}44` }}>
                            {initials(student)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: P.text }}>
                              {student.firstname} {student.lastname}
                            </p>
                            <p className="text-xs" style={{ color: P.muted }}>
                              #{String(idx + 1 + (currentPage - 1) * PER_PAGE).padStart(4, "0")}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4">
                        <span className="text-sm" style={{ color: P.muted }}>{student.email}</span>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full border"
                          style={{ background: `${P.blue}18`, borderColor: `${P.blue}44`, color: P.blueGlow }}>
                          {student.department || "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {student.isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border"
                            style={{ background: "rgba(248,113,113,0.12)", borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border"
                            style={{ background: "rgba(74,222,128,0.12)", borderColor: "rgba(74,222,128,0.3)", color: "#4ade80" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* ── Actions ── */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* Block — only show if not already blocked */}
                          {!student.isBlocked && (
                            <ActionBtn
                              label="Block"
                              onClick={() => handleBlock(student._id)}
                              disabled={anyLoading}
                              color="#fbbf24"
                              bg="rgba(251,191,36,0.08)"
                              border="rgba(251,191,36,0.3)"
                              hoverBg="rgba(251,191,36,0.18)"
                            />
                          )}
                          {/* Unblock — only show if currently blocked */}
                          {student.isBlocked && (
                            <ActionBtn
                              label="Unblock"
                              onClick={() => handleUnblock(student._id)}
                              disabled={anyLoading}
                              color="#4ade80"
                              bg="rgba(74,222,128,0.08)"
                              border="rgba(74,222,128,0.3)"
                              hoverBg="rgba(74,222,128,0.18)"
                            />
                          )}
                          {/* Soft Delete — always visible */}
                          <ActionBtn
                            label="Delete"
                            onClick={() => handleSoftDelete(student._id)}
                            disabled={anyLoading}
                            color="#f87171"
                            bg="rgba(248,113,113,0.08)"
                            border="rgba(248,113,113,0.3)"
                            hoverBg="rgba(248,113,113,0.18)"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl opacity-40">🎓</span>
                      <p className="font-semibold" style={{ color: P.muted }}>No students found</p>
                      {search && (
                        <button onClick={() => handleSearch("")} className="text-xs underline"
                          style={{ color: P.blueGlow }}>Clear search</button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t" style={{ borderColor: P.border }}>
            <p className="text-xs" style={{ color: P.muted }}>
              Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-30"
                style={{ borderColor: P.border, color: P.muted, background: "transparent" }}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className="w-8 h-8 rounded-lg text-xs font-bold border transition"
                  style={{
                    background: currentPage === p ? `linear-gradient(135deg,${P.blueDark},${P.blue})` : "transparent",
                    borderColor: currentPage === p ? P.blue : P.border,
                    color: currentPage === p ? "#fff" : P.muted,
                    boxShadow: currentPage === p ? `0 0 10px ${P.blue}44` : "none",
                  }}>{p}</button>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-30"
                style={{ borderColor: P.border, color: P.muted, background: "transparent" }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;