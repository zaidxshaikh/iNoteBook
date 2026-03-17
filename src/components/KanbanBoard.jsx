import { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiColumns, FiFilter } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

const STORAGE_KEY = "inotebook-kanban";
const COLUMNS = [
  { key: "todo", label: "To Do", color: "#f59e0b" },
  { key: "progress", label: "In Progress", color: "#3b82f6" },
  { key: "done", label: "Done", color: "#10b981" },
];

const dotColorMap = {
  pinned: "#eab308", personal: "#3b82f6", work: "#f59e0b",
  ideas: "#8b5cf6", important: "#ef4444", study: "#10b981",
  todo: "#ec4899", general: "#7c3aed",
};

function loadStatuses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveStatuses(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export default function KanbanBoard({ showAlert }) {
  const { notes, editNote } = useContext(noteContext);
  const { dark } = useTheme();
  const [statuses, setStatuses] = useState(loadStatuses);
  const [filterTag, setFilterTag] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    saveStatuses(statuses);
  }, [statuses]);

  const getStatus = useCallback(
    (note) => statuses[note._id] || note.status || "todo",
    [statuses]
  );

  const tags = useMemo(() => {
    const set = new Set();
    (notes || []).forEach((n) => set.add(n.tag || "General"));
    return ["All", ...Array.from(set).sort()];
  }, [notes]);

  const filtered = useMemo(() => {
    if (!notes) return [];
    if (filterTag === "All") return notes;
    return notes.filter((n) => (n.tag || "General") === filterTag);
  }, [notes, filterTag]);

  const columns = useMemo(() => {
    const map = { todo: [], progress: [], done: [] };
    filtered.forEach((n) => {
      const s = getStatus(n);
      if (map[s]) map[s].push(n);
      else map.todo.push(n);
    });
    return map;
  }, [filtered, getStatus]);

  const move = (noteId, direction) => {
    const order = ["todo", "progress", "done"];
    const current = statuses[noteId] || "todo";
    const idx = order.indexOf(current);
    const next = idx + direction;
    if (next < 0 || next >= order.length) return;
    setStatuses((prev) => ({ ...prev, [noteId]: order[next] }));
    const labels = { todo: "To Do", progress: "In Progress", done: "Done" };
    showAlert(`Moved to ${labels[order[next]]}`, "success");
  };

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";
  const cardBorder = dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.7)";
  const colBg = dark ? "rgba(15,23,42,0.4)" : "rgba(241,245,249,0.5)";
  const primary = "#7c3aed";

  const fmtDate = (d) => {
    if (!d) return "";
    const ms = Date.now() - new Date(d);
    const m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), dy = Math.floor(ms / 86400000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (dy < 7) return `${dy}d ago`;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div style={{ padding: "24px 0" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12, marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FiColumns size={22} style={{ color: primary }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: txt, margin: 0 }}>Kanban Board</h2>
        </div>

        {/* Filter */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowFilter((p) => !p)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10, cursor: "pointer",
              border: `1px solid ${cardBorder}`,
              background: dark ? "rgba(30,41,59,0.6)" : "rgba(255,255,255,0.8)",
              color: filterTag !== "All" ? primary : sub,
              fontSize: 13, fontWeight: 600,
            }}
          >
            <FiFilter size={14} />
            {filterTag !== "All" ? filterTag : "Filter by tag"}
          </button>

          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="card"
                style={{
                  position: "absolute", right: 0, top: "calc(100% + 6px)",
                  zIndex: 30, minWidth: 160, padding: 6, borderRadius: 12,
                }}
              >
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setFilterTag(tag); setShowFilter(false); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "7px 12px", border: "none", borderRadius: 8,
                      cursor: "pointer", fontSize: 13, fontWeight: 500,
                      background: filterTag === tag ? (dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)") : "transparent",
                      color: filterTag === tag ? primary : sub,
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Columns */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20,
      }}>
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            style={{
              background: colBg,
              borderRadius: 16,
              border: `1px solid ${cardBorder}`,
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Column header */}
            <div style={{
              padding: "14px 18px",
              borderBottom: `1px solid ${cardBorder}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderRadius: "16px 16px 0 0",
              background: `linear-gradient(135deg, ${col.color}18, transparent)`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: col.color,
                  boxShadow: `0 0 8px ${col.color}60`,
                }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: txt }}>{col.label}</span>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, color: col.color,
                background: `${col.color}18`,
                padding: "2px 10px", borderRadius: 20,
              }}>
                {columns[col.key].length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <AnimatePresence mode="popLayout">
                {columns[col.key].length === 0 && (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      textAlign: "center", color: muted, fontSize: 13,
                      padding: "32px 0", margin: 0,
                    }}
                  >
                    No notes here
                  </motion.p>
                )}

                {columns[col.key].map((note) => {
                  const tagKey = (note.tag || "general").toLowerCase();
                  const dot = note.color || dotColorMap[tagKey] || dotColorMap.general;
                  const status = getStatus(note);
                  const canLeft = status !== "todo";
                  const canRight = status !== "done";

                  return (
                    <motion.div
                      key={note._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="card"
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        borderLeft: `3px solid ${dot}`,
                        cursor: "default",
                      }}
                    >
                      {/* Tag row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: dot, flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          textTransform: "uppercase", letterSpacing: "0.05em",
                          color: dot,
                        }}>
                          {note.tag || "General"}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 style={{
                        fontSize: 14, fontWeight: 700, color: txt,
                        margin: "0 0 4px 0",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {note.title}
                      </h4>

                      {/* Description (truncated) */}
                      <p style={{
                        fontSize: 12, color: sub, margin: "0 0 10px 0",
                        lineHeight: 1.5,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {note.description}
                      </p>

                      {/* Footer: date + arrows */}
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}>
                        <span style={{ fontSize: 11, color: muted }}>{fmtDate(note.date)}</span>

                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => canLeft && move(note._id, -1)}
                            disabled={!canLeft}
                            style={{
                              width: 26, height: 26, borderRadius: 8,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              border: "none", cursor: canLeft ? "pointer" : "not-allowed",
                              background: canLeft
                                ? (dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.7)")
                                : "transparent",
                              color: canLeft ? sub : (dark ? "rgba(51,65,85,0.3)" : "rgba(203,213,225,0.7)"),
                              transition: "all 0.15s ease",
                            }}
                            title="Move left"
                          >
                            <FiChevronLeft size={14} />
                          </button>
                          <button
                            onClick={() => canRight && move(note._id, 1)}
                            disabled={!canRight}
                            style={{
                              width: 26, height: 26, borderRadius: 8,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              border: "none", cursor: canRight ? "pointer" : "not-allowed",
                              background: canRight
                                ? (dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.7)")
                                : "transparent",
                              color: canRight ? sub : (dark ? "rgba(51,65,85,0.3)" : "rgba(203,213,225,0.7)"),
                              transition: "all 0.15s ease",
                            }}
                            title="Move right"
                          >
                            <FiChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
