import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const AdminLecturers = () => {
  const navigate = useNavigate();

  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // "active" | "inactive"
  const [currentPage, setCurrentPage] = useState(1);
  const [togglingId, setTogglingId] = useState(null);

  const PER_PAGE = 8;

  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const res = await API.get("/auth/admin/lecturers");
        setLecturers(res.data?.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load lecturers");
      } finally {
        setLoading(false);
      }
    };
    fetchLecturers();
  }, []);

  const initials = (l) =>
    `${l?.firstname?.[0] || ""}${l?.lastname?.[0] || ""}`.toUpperCase();

  const avatarColor = (name = "") => {
    const colors = [
      "#4F46E5", "#7C3AED", "#DB2777", "#059669",
      "#D97706", "#DC2626", "#2563EB", "#0891B2",
    ];
    const idx = (name.charCodeAt(0) || 0) % colors.length;
    return colors[idx];
  };

  const handleToggleStatus = async (lecturer) => {
    setTogglingId(lecturer._id);
    try {
      if (lecturer.isBlocked) {
        // Currently blocked → Unblock them → status becomes Active
        await API.put(`/admin/users/${lecturer._id}/unblock`);
      } else {
        // Currently active → Block them → status becomes Inactive
        await API.put(`/admin/users/${lecturer._id}/block`);
      }

      setLecturers((prev) =>
        prev.map((l) =>
          l._id === lecturer._id ? { ...l, isBlocked: !l.isBlocked } : l
        )
      );
    } catch (err) {
      console.error("Failed to toggle status", err);
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = lecturers.filter((l) => {
    const matchSearch = `${l?.firstname || ""} ${l?.lastname || ""} ${l?.email || ""} ${l?.department || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchTab =
      activeTab === "active" ? !l?.isBlocked : l?.isBlocked;

    return matchSearch && matchTab;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const counts = {
    active: lecturers.filter((l) => !l?.isBlocked).length,
    inactive: lecturers.filter((l) => l?.isBlocked).length,
  };

  const handleSearch = (v) => {
    setSearch(v);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearch("");
  };

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading lecturers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorWrapper}>
        <span style={styles.errorIcon}>⚠️</span>
        <p style={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
      {/* ── HEADER ── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate("/admin-dashboard")} style={styles.backBtn}>
            ← Dashboard
          </button>
          <div>
            <h1 style={styles.pageTitle}>Lecturer Management</h1>
            <p style={styles.pageSubtitle}>
              {lecturers.length} total lecturers across all departments
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        <div style={styles.statsPills}>
          <div style={{ ...styles.statPill, background: "#ECFDF5", color: "#065F46" }}>
            <span style={styles.statDot("#10B981")} />
            {counts.active} Active
          </div>
          <div style={{ ...styles.statPill, background: "#FEF2F2", color: "#991B1B" }}>
            <span style={styles.statDot("#EF4444")} />
            {counts.inactive} Inactive
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={styles.tabsRow}>
        <div style={styles.tabs}>
          <button
            onClick={() => handleTabChange("active")}
            style={{
              ...styles.tab,
              ...(activeTab === "active" ? styles.tabActive : styles.tabInactive),
            }}
          >
            <span style={styles.tabIcon}>🎓</span>
            Active Lecturers
            <span
              style={{
                ...styles.tabBadge,
                background: activeTab === "active" ? "#4F46E5" : "#E5E7EB",
                color: activeTab === "active" ? "#fff" : "#6B7280",
              }}
            >
              {counts.active}
            </span>
          </button>

          <button
            onClick={() => handleTabChange("inactive")}
            style={{
              ...styles.tab,
              ...(activeTab === "inactive" ? styles.tabActiveRed : styles.tabInactive),
            }}
          >
            <span style={styles.tabIcon}>🚫</span>
            Inactive Lecturers
            <span
              style={{
                ...styles.tabBadge,
                background: activeTab === "inactive" ? "#EF4444" : "#E5E7EB",
                color: activeTab === "inactive" ? "#fff" : "#6B7280",
              }}
            >
              {counts.inactive}
            </span>
          </button>
        </div>

        {/* Search */}
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder={`Search ${activeTab} lecturers...`}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* ── INACTIVE BANNER ── */}
      {activeTab === "inactive" && (
        <div style={styles.inactiveBanner}>
          <span>⚠️</span>
          <span>
            These lecturers are currently <strong>blocked</strong> and cannot access the platform. Toggle their status to restore access.
          </span>
        </div>
      )}

      {/* ── TABLE ── */}
      <div style={styles.card}>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={{ ...styles.th, width: 48 }}>#</th>
                <th style={styles.th}>Lecturer</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length > 0 ? (
                paginated.map((l, idx) => {
                  const color = avatarColor(l.firstname || "");
                  const isToggling = togglingId === l._id;
                  const rowNum = (currentPage - 1) * PER_PAGE + idx + 1;

                  return (
                    <tr
                      key={l._id}
                      style={styles.row}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F8FAFF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#fff";
                      }}
                    >
                      {/* Row number */}
                      <td style={{ ...styles.td, color: "#9CA3AF", fontWeight: 500 }}>
                        {rowNum}
                      </td>

                      {/* Lecturer info */}
                      <td style={styles.td}>
                        <div style={styles.lecturerCell}>
                          <div
                            style={{
                              ...styles.avatar,
                              background: color,
                            }}
                          >
                            {initials(l)}
                          </div>
                          <div>
                            <div style={styles.name}>
                              {l.firstname || "-"} {l.lastname || ""}
                            </div>
                            <div style={styles.role}>Lecturer</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={styles.td}>
                        <span style={styles.email}>{l.email || "-"}</span>
                      </td>

                      {/* Department */}
                      <td style={styles.td}>
                        {l.department ? (
                          <span style={styles.deptBadge}>{l.department}</span>
                        ) : (
                          <span style={{ color: "#9CA3AF" }}>—</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td style={styles.td}>
                        {l.isBlocked ? (
                          <span style={styles.badgeInactive}>
                            <span style={{ ...styles.statusDot, background: "#EF4444" }} />
                            Inactive
                          </span>
                        ) : (
                          <span style={styles.badgeActive}>
                            <span
                              style={{
                                ...styles.statusDot,
                                background: "#10B981",
                                animation: "pulse 2s infinite",
                              }}
                            />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <button
                          onClick={() => handleToggleStatus(l)}
                          disabled={isToggling}
                          style={{
                            ...styles.actionBtn,
                            ...(l.isBlocked ? styles.actionBtnActivate : styles.actionBtnDeactivate),
                            opacity: isToggling ? 0.6 : 1,
                            cursor: isToggling ? "not-allowed" : "pointer",
                          }}
                        >
                          {isToggling
                            ? "Updating..."
                            : l.isBlocked
                            ? "✓ Activate"
                            : "✕ Deactivate"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={styles.emptyCell}>
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>
                        {activeTab === "active" ? "🎓" : "🚫"}
                      </div>
                      <p style={styles.emptyTitle}>
                        No {activeTab} lecturers found
                      </p>
                      <p style={styles.emptySubtitle}>
                        {search
                          ? "Try adjusting your search terms"
                          : activeTab === "inactive"
                          ? "All lecturers are currently active"
                          : "No lecturers have been added yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <span style={styles.pageInfo}>
              Showing {(currentPage - 1) * PER_PAGE + 1}–
              {Math.min(currentPage * PER_PAGE, filtered.length)} of{" "}
              {filtered.length} lecturers
            </span>

            <div style={styles.pageControls}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageBtn,
                  opacity: currentPage === 1 ? 0.4 : 1,
                }}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  style={{
                    ...styles.pageBtn,
                    ...(p === currentPage ? styles.pageBtnActive : {}),
                  }}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.pageBtn,
                  opacity: currentPage === totalPages ? 0.4 : 1,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────── STYLES ───────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#F1F5F9",
    padding: "32px 28px",
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
  },

  // Loading
  loadingWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: 12,
    background: "#F1F5F9",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #E0E7FF",
    borderTop: "4px solid #4F46E5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#6B7280", fontSize: 15 },

  // Error
  errorWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: 8,
  },
  errorIcon: { fontSize: 32 },
  errorText: { color: "#EF4444", fontSize: 16, fontWeight: 600 },

  // Header
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 28,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "#fff",
    border: "1.5px solid #E5E7EB",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  pageTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    color: "#111827",
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#6B7280",
  },

  // Stats
  statsPills: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  statPill: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "8px 16px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
    border: "none",
  },
  statDot: (color) => ({
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
  }),

  // Tabs row
  tabsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  tabs: {
    display: "flex",
    gap: 6,
    background: "#fff",
    borderRadius: 12,
    padding: 5,
    border: "1.5px solid #E5E7EB",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 18px",
    borderRadius: 9,
    border: "none",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.18s ease",
  },
  tabActive: {
    background: "#4F46E5",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
  },
  tabActiveRed: {
    background: "#EF4444",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
  },
  tabInactive: {
    background: "transparent",
    color: "#6B7280",
  },
  tabIcon: {
    fontSize: 15,
  },
  tabBadge: {
    padding: "1px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    minWidth: 22,
    textAlign: "center",
  },

  // Search
  searchWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    fontSize: 14,
    pointerEvents: "none",
  },
  searchInput: {
    paddingLeft: 36,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 10,
    border: "1.5px solid #E5E7EB",
    borderRadius: 10,
    fontSize: 13.5,
    width: 260,
    outline: "none",
    background: "#fff",
    color: "#111827",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },

  // Inactive banner
  inactiveBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 18px",
    background: "#FFF7ED",
    border: "1.5px solid #FED7AA",
    borderRadius: 10,
    color: "#92400E",
    fontSize: 13.5,
    marginBottom: 16,
  },

  // Card
  card: {
    background: "#fff",
    borderRadius: 16,
    border: "1.5px solid #E5E7EB",
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },

  // Table
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  theadRow: {
    background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)",
  },
  th: {
    padding: "14px 18px",
    color: "#C7D2FE",
    fontWeight: 700,
    fontSize: 11.5,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  row: {
    borderBottom: "1px solid #F3F4F6",
    background: "#fff",
    transition: "background 0.15s ease",
  },
  td: {
    padding: "14px 18px",
    color: "#374151",
    verticalAlign: "middle",
  },

  // Lecturer cell
  lecturerCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 800,
    fontSize: 14,
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  name: {
    fontWeight: 700,
    color: "#111827",
    fontSize: 14,
  },
  role: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 1,
  },

  email: {
    color: "#4F46E5",
    fontSize: 13.5,
  },

  deptBadge: {
    display: "inline-block",
    padding: "4px 12px",
    background: "#EEF2FF",
    color: "#4338CA",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },

  // Status badges
  badgeActive: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    background: "#ECFDF5",
    color: "#065F46",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid #A7F3D0",
  },
  badgeInactive: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    background: "#FEF2F2",
    color: "#991B1B",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid #FECACA",
  },
  dot: (color) => ({
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
  }),

  // Status toggle button (replaces both badge + action button)
  statusToggleBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "7px 16px",
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: 700,
    transition: "all 0.18s ease",
    whiteSpace: "nowrap",
    outline: "none",
  },
  statusToggleBtnActive: {
    background: "#ECFDF5",
    color: "#065F46",
    border: "1.5px solid #6EE7B7",
    boxShadow: "0 1px 4px rgba(16,185,129,0.15)",
  },
  statusToggleBtnInactive: {
    background: "#FEF2F2",
    color: "#991B1B",
    border: "1.5px solid #FECACA",
    boxShadow: "0 1px 4px rgba(239,68,68,0.10)",
  },
  statusDot: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  statusArrow: {
    fontSize: 11,
    opacity: 0.5,
    marginLeft: 2,
  },

  // Empty state
  emptyCell: {
    padding: "60px 20px",
    textAlign: "center",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: { fontSize: 44, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: "#374151", margin: 0 },
  emptySubtitle: { fontSize: 13.5, color: "#9CA3AF", margin: 0 },

  // Pagination
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    padding: "16px 20px",
    borderTop: "1px solid #F3F4F6",
    background: "#FAFAFA",
  },
  pageInfo: {
    fontSize: 13,
    color: "#6B7280",
  },
  pageControls: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  pageBtn: {
    padding: "7px 14px",
    border: "1.5px solid #E5E7EB",
    borderRadius: 8,
    background: "#fff",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    cursor: "pointer",
  },
  pageBtnActive: {
    background: "#4F46E5",
    color: "#fff",
    borderColor: "#4F46E5",
    boxShadow: "0 2px 6px rgba(79,70,229,0.35)",
  },
};

export default AdminLecturers;