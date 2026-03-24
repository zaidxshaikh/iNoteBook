import { useContext, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FiClock, FiFilter, FiSearch, FiFileText } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

function formatDateHeader(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = today.getTime() - target.getTime();
  const dayMs = 86400000;

  if (diff < dayMs && diff >= 0) return "Today";
  if (diff < dayMs * 2 && diff >= dayMs) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function truncate(str, len = 120) {
  if (!str || str.length <= len) return str || "";
  return str.slice(0, len).trimEnd() + "...";
}

function wordCount(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TimelineView({ showAlert }) {
  const { notes } = useContext(noteContext);
  const { dark } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";
  const cardBg = dark ? "rgba(30,41,59,0.5)" : "rgba(255,255,255,0.7)";
  const border = dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.6)";
  const primary = "#7c3aed";
  const inputBg = dark ? "rgba(30,41,59,0.6)" : "rgba(241,245,249,0.8)";

  // Extract all unique tags
  const allTags = useMemo(() => {
    if (!notes) return [];
    const tags = new Set();
    notes.forEach((n) => {
      if (n.tag) tags.add(n.tag);
    });
    return Array.from(tags).sort();
  }, [notes]);

  // Filter and group notes by day
  const groupedNotes = useMemo(() => {
    if (!notes) return [];

    let filtered = [...notes];

    if (selectedTag !== "All") {
      filtered = filtered.filter((n) => n.tag === selectedTag);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.description && n.description.toLowerCase().includes(q)) ||
          (n.tag && n.tag.toLowerCase().includes(q))
      );
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Group by day
    const groups = [];
    const map = {};
    filtered.forEach((note) => {
      const d = new Date(note.date);
      const key = dayKey(d);
      if (!map[key]) {
        map[key] = { key, date: d, label: formatDateHeader(d), notes: [] };
        groups.push(map[key]);
      }
      map[key].notes.push(note);
    });

    return groups;
  }, [notes, selectedTag, searchQuery]);

  const totalFiltered = groupedNotes.reduce((s, g) => s + g.notes.length, 0);

  // Inline media query via a style tag for responsive layout
  const responsiveId = "timeline-responsive-styles";

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      {/* Inject responsive CSS */}
      <style>{`
        .tl-card-left { transform-origin: right center; }
        .tl-card-right { transform-origin: left center; }
        @media (max-width: 768px) {
          .tl-row { flex-direction: row !important; }
          .tl-card-left, .tl-card-right {
            width: 100% !important;
            margin-left: 40px !important;
            margin-right: 0 !important;
            text-align: left !important;
          }
          .tl-spacer { display: none !important; }
          .tl-center-line {
            left: 20px !important;
            transform: none !important;
          }
          .tl-dot {
            left: 20px !important;
            transform: translateX(-50%) !important;
          }
          .tl-date-header {
            margin-left: 40px !important;
            text-align: left !important;
          }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FiClock size={26} style={{ color: primary }} />
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: txt }}>
            Timeline
          </h2>
          <span
            style={{
              fontSize: 13,
              color: muted,
              background: dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.1)",
              padding: "2px 10px",
              borderRadius: 12,
              fontWeight: 500,
            }}
          >
            {totalFiltered} note{totalFiltered !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={() => setShowFilters((f) => !f)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            borderRadius: 10,
            border: `1px solid ${border}`,
            background: showFilters ? primary : "transparent",
            color: showFilters ? "#fff" : txt,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            transition: "all 0.2s",
          }}
        >
          <FiFilter size={15} />
          Filters
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            marginBottom: 24,
            padding: 16,
            borderRadius: 14,
            border: `1px solid ${border}`,
            background: cardBg,
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Search bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px",
              borderRadius: 10,
              background: inputBg,
              border: `1px solid ${border}`,
              marginBottom: 14,
            }}
          >
            <FiSearch size={16} style={{ color: muted, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: txt,
                fontSize: 14,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  color: muted,
                  cursor: "pointer",
                  fontSize: 16,
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            )}
          </div>

          {/* Tag filter */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 13, color: sub, fontWeight: 500 }}>
              Tags:
            </span>
            {["All", ...allTags].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: "4px 14px",
                  borderRadius: 20,
                  border:
                    selectedTag === tag
                      ? `1.5px solid ${primary}`
                      : `1px solid ${border}`,
                  background:
                    selectedTag === tag
                      ? dark
                        ? "rgba(124,58,237,0.2)"
                        : "rgba(124,58,237,0.1)"
                      : "transparent",
                  color: selectedTag === tag ? primary : sub,
                  fontSize: 13,
                  fontWeight: selectedTag === tag ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      {groupedNotes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: muted,
          }}
        >
          <FiFileText
            size={48}
            style={{ marginBottom: 16, opacity: 0.4, color: muted }}
          />
          <p style={{ fontSize: 16, fontWeight: 500, margin: "0 0 6px" }}>
            No notes found
          </p>
          <p style={{ fontSize: 13, margin: 0 }}>
            {searchQuery || selectedTag !== "All"
              ? "Try adjusting your filters"
              : "Create your first note to see it here"}
          </p>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Center vertical line */}
          <div
            className="tl-center-line"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 2,
              background: `linear-gradient(to bottom, ${primary}44, ${border}, transparent)`,
              borderRadius: 2,
            }}
          />

          {groupedNotes.map((group, gi) => (
            <div key={group.key} style={{ marginBottom: 8 }}>
              {/* Date header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.3 }}
                className="tl-date-header"
                style={{ textAlign: "center", margin: "28px 0 20px", position: "relative", zIndex: 2 }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 20px",
                    borderRadius: 20,
                    background: dark
                      ? "rgba(124,58,237,0.15)"
                      : "rgba(124,58,237,0.08)",
                    border: `1px solid ${primary}33`,
                    color: primary,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                  }}
                >
                  {group.label}
                </span>
              </motion.div>

              {/* Notes in this group */}
              {group.notes.map((note, ni) => {
                const globalIndex =
                  groupedNotes
                    .slice(0, gi)
                    .reduce((s, g) => s + g.notes.length, 0) + ni;
                const isLeft = globalIndex % 2 === 0;
                const noteDate = new Date(note.date);
                const dotColor = note.color || primary;
                const words = wordCount(note.description);

                return (
                  <div
                    key={note._id}
                    className="tl-row"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      position: "relative",
                      marginBottom: 20,
                      flexDirection: isLeft ? "row" : "row-reverse",
                    }}
                  >
                    {/* Card side */}
                    <motion.div
                      className={isLeft ? "tl-card-left card" : "tl-card-right card"}
                      initial={{ opacity: 0, x: isLeft ? -40 : 40, y: 20 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        duration: 0.45,
                        delay: ni * 0.08,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      style={{
                        width: "calc(50% - 28px)",
                        padding: 18,
                        borderRadius: 14,
                        background: cardBg,
                        border: `1px solid ${border}`,
                        backdropFilter: "blur(12px)",
                        cursor: "pointer",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                        textAlign: isLeft ? "right" : "left",
                      }}
                      whileHover={{
                        borderColor: primary,
                        boxShadow: `0 4px 20px ${primary}22`,
                      }}
                    >
                      {/* Tag badge + time */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                          justifyContent: isLeft ? "flex-end" : "flex-start",
                          flexWrap: "wrap",
                        }}
                      >
                        {note.tag && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 10px",
                              borderRadius: 12,
                              background: dark
                                ? "rgba(124,58,237,0.18)"
                                : "rgba(124,58,237,0.1)",
                              color: primary,
                              letterSpacing: 0.3,
                              textTransform: "uppercase",
                            }}
                          >
                            {note.tag}
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: muted }}>
                          {formatTime(noteDate)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        style={{
                          margin: "0 0 6px",
                          fontSize: 15,
                          fontWeight: 600,
                          color: txt,
                          lineHeight: 1.35,
                        }}
                      >
                        {note.title}
                      </h3>

                      {/* Description */}
                      {note.description && (
                        <p
                          style={{
                            margin: "0 0 10px",
                            fontSize: 13,
                            color: sub,
                            lineHeight: 1.55,
                          }}
                        >
                          {truncate(note.description)}
                        </p>
                      )}

                      {/* Footer: date + word count */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          justifyContent: isLeft ? "flex-end" : "flex-start",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            color: muted,
                          }}
                        >
                          <FiClock size={11} />
                          {noteDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 11,
                            color: muted,
                          }}
                        >
                          <FiFileText size={11} />
                          {words} word{words !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </motion.div>

                    {/* Center dot */}
                    <div
                      className="tl-dot"
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 22,
                        transform: "translateX(-50%)",
                        zIndex: 3,
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                          delay: ni * 0.08,
                        }}
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: dotColor,
                          border: `3px solid ${dark ? "#1e293b" : "#f8fafc"}`,
                          boxShadow: `0 0 0 2px ${dotColor}44, 0 2px 8px ${dotColor}33`,
                        }}
                      />
                    </div>

                    {/* Spacer on opposite side */}
                    <div
                      className="tl-spacer"
                      style={{ width: "calc(50% - 28px)" }}
                    />
                  </div>
                );
              })}
            </div>
          ))}

          {/* End marker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: muted,
                opacity: 0.5,
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
