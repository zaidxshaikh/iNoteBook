import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiHome,
  FiCalendar,
  FiColumns,
  FiClock,
  FiBarChart2,
  FiCheckSquare,
  FiPlus,
  FiMoon,
  FiDownload,
  FiTrash2,
  FiSettings,
  FiFileText,
  FiEdit3,
  FiLink,
  FiPrinter,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import noteContext from "../context/notes/noteContext";

const STORAGE_KEY = "inotebook-recent-commands";

const PAGE_ITEMS = [
  { id: "page-home", label: "Home", icon: FiHome, category: "Pages", path: "/", shortcut: "Alt+H" },
  { id: "page-calendar", label: "Calendar", icon: FiCalendar, category: "Pages", path: "/calendar", shortcut: "Alt+C" },
  { id: "page-kanban", label: "Kanban Board", icon: FiColumns, category: "Pages", path: "/kanban", shortcut: "Alt+K" },
  { id: "page-pomodoro", label: "Pomodoro Timer", icon: FiClock, category: "Pages", path: "/pomodoro" },
  { id: "page-analytics", label: "Analytics", icon: FiBarChart2, category: "Pages", path: "/analytics" },
  { id: "page-habits", label: "Habit Tracker", icon: FiCheckSquare, category: "Pages", path: "/habits" },
  { id: "page-trash", label: "Trash", icon: FiTrash2, category: "Pages", path: "/trash" },
  { id: "page-about", label: "About", icon: FiSettings, category: "Pages", path: "/about" },
];

const ACTION_ITEMS = [
  { id: "new-note", label: "New Note", icon: FiPlus, category: "Actions", shortcut: "Ctrl+N" },
  { id: "toggle-theme", label: "Toggle Theme", icon: FiMoon, category: "Actions", shortcut: "Ctrl+D" },
  { id: "export", label: "Export Notes", icon: FiDownload, category: "Actions" },
  { id: "print", label: "Print Note", icon: FiPrinter, category: "Actions", shortcut: "Ctrl+P" },
  { id: "sync", label: "Sync Notes", icon: FiRefreshCw, category: "Actions" },
  { id: "connect-device", label: "Connect Device", icon: FiLink, category: "Actions" },
];

function fuzzyMatch(text, query) {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.length === 0) return { match: true, score: 0 };
  if (lowerText.includes(lowerQuery)) return { match: true, score: 2 };
  let qi = 0;
  let score = 0;
  let lastIdx = -1;
  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) {
      score += 1;
      if (lastIdx !== -1 && ti === lastIdx + 1) score += 0.5;
      lastIdx = ti;
      qi++;
    }
  }
  if (qi === lowerQuery.length) return { match: true, score };
  return { match: false, score: 0 };
}

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecent(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 8)));
  } catch {}
}

export default function CommandPalette({ open, onClose, onAction }) {
  const { dark } = useTheme();
  const { notes } = useContext(noteContext);
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [recentSearches, setRecentSearches] = useState(loadRecent);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const bg = dark ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.97)";
  const cardBg = dark ? "rgba(30, 41, 59, 0.85)" : "rgba(248, 250, 252, 0.9)";
  const hoverBg = dark ? "rgba(124, 58, 237, 0.18)" : "rgba(124, 58, 237, 0.1)";
  const selectedBg = dark ? "rgba(124, 58, 237, 0.25)" : "rgba(124, 58, 237, 0.15)";
  const primary = "#7c3aed";
  const borderColor = dark ? "rgba(148, 163, 184, 0.15)" : "rgba(100, 116, 139, 0.15)";

  const noteItems = useMemo(
    () =>
      (notes || []).map((n) => ({
        id: `note-${n._id}`,
        label: n.title,
        description: n.description?.slice(0, 60),
        icon: FiFileText,
        category: "Notes",
        noteId: n._id,
      })),
    [notes]
  );

  const allItems = useMemo(() => [...PAGE_ITEMS, ...ACTION_ITEMS, ...noteItems], [noteItems]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return allItems
      .map((item) => {
        const titleMatch = fuzzyMatch(item.label, query);
        const catMatch = fuzzyMatch(item.category, query);
        const descMatch = item.description ? fuzzyMatch(item.description, query) : { match: false, score: 0 };
        const bestScore = Math.max(titleMatch.score, catMatch.score * 0.5, descMatch.score * 0.7);
        const matched = titleMatch.match || catMatch.match || descMatch.match;
        return { ...item, score: bestScore, matched };
      })
      .filter((item) => item.matched)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  }, [query, allItems]);

  const displayItems = query.trim()
    ? results
    : recentSearches.length > 0
    ? recentSearches.map((label) => allItems.find((i) => i.label === label)).filter(Boolean)
    : allItems.slice(0, 10);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setRecentSearches(loadRecent());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector(`[data-idx="${selectedIdx}"]`);
      if (selected) selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIdx]);

  const executeItem = useCallback(
    (item) => {
      if (!item) return;
      const updated = [item.label, ...recentSearches.filter((r) => r !== item.label)].slice(0, 8);
      setRecentSearches(updated);
      saveRecent(updated);

      if (item.path) {
        navigate(item.path);
        onClose();
      } else if (item.noteId) {
        navigate("/");
        onClose();
      } else {
        onAction?.(item.id);
        onClose();
      }
    },
    [navigate, onClose, onAction, recentSearches]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((prev) => (prev + 1) % Math.max(displayItems.length, 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((prev) => (prev - 1 + displayItems.length) % Math.max(displayItems.length, 1));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (displayItems[selectedIdx]) executeItem(displayItems[selectedIdx]);
        return;
      }
    },
    [displayItems, selectedIdx, executeItem, onClose]
  );

  useEffect(() => {
    function handleGlobalKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
      }
    }
    if (open) {
      window.addEventListener("keydown", handleGlobalKey);
      return () => window.removeEventListener("keydown", handleGlobalKey);
    }
  }, [open]);

  const categoryBadge = (cat) => {
    const colors = {
      Pages: { bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" },
      Actions: { bg: "rgba(124, 58, 237, 0.15)", color: "#a78bfa" },
      Notes: { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399" },
    };
    const c = colors[cat] || colors.Actions;
    return (
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: "9999px",
          background: c.bg,
          color: c.color,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
        }}
      >
        {cat}
      </span>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "12vh",
            background: dark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              maxWidth: "580px",
              background: bg,
              borderRadius: "16px",
              border: `1px solid ${borderColor}`,
              boxShadow: dark
                ? "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(148,163,184,0.08)"
                : "0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(100,116,139,0.08)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxHeight: "70vh",
            }}
          >
            {/* Search input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 20px",
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <FiSearch style={{ color: sub, fontSize: "20px", flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "16px",
                  color: txt,
                  fontFamily: "inherit",
                  caretColor: primary,
                }}
              />
              <kbd
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: dark ? "rgba(148,163,184,0.1)" : "rgba(100,116,139,0.1)",
                  color: sub,
                  border: `1px solid ${borderColor}`,
                  whiteSpace: "nowrap",
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Section label */}
            {displayItems.length > 0 && (
              <div
                style={{
                  padding: "10px 20px 4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: sub,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {query.trim() ? `${results.length} result${results.length !== 1 ? "s" : ""}` : recentSearches.length > 0 ? "Recent" : "Suggestions"}
              </div>
            )}

            {/* Results list */}
            <div
              ref={listRef}
              style={{
                overflowY: "auto",
                padding: "4px 8px 8px",
                flex: 1,
              }}
            >
              {displayItems.length === 0 && query.trim() && (
                <div
                  style={{
                    padding: "32px 20px",
                    textAlign: "center",
                    color: sub,
                    fontSize: "14px",
                  }}
                >
                  No results found for "{query}"
                </div>
              )}
              {displayItems.map((item, idx) => {
                const Icon = item.icon || FiArrowRight;
                const isSelected = idx === selectedIdx;
                return (
                  <div
                    key={item.id}
                    data-idx={idx}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      background: isSelected ? selectedBg : "transparent",
                      transition: "background 0.12s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isSelected ? `${primary}22` : cardBg,
                        border: `1px solid ${isSelected ? `${primary}44` : borderColor}`,
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        style={{
                          fontSize: "16px",
                          color: isSelected ? primary : sub,
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 500,
                          color: isSelected ? txt : txt,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.label}
                      </div>
                      {item.description && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: sub,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginTop: "1px",
                          }}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>
                    {categoryBadge(item.category)}
                    {item.shortcut && (
                      <kbd
                        style={{
                          fontSize: "11px",
                          fontFamily: "monospace",
                          padding: "2px 7px",
                          borderRadius: "5px",
                          background: dark ? "rgba(148,163,184,0.08)" : "rgba(100,116,139,0.08)",
                          color: sub,
                          border: `1px solid ${borderColor}`,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "10px 20px",
                borderTop: `1px solid ${borderColor}`,
                fontSize: "11px",
                color: sub,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <kbd style={{ padding: "1px 5px", borderRadius: "4px", border: `1px solid ${borderColor}`, fontFamily: "monospace", fontSize: "10px" }}>
                  &uarr;&darr;
                </kbd>{" "}
                Navigate
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <kbd style={{ padding: "1px 5px", borderRadius: "4px", border: `1px solid ${borderColor}`, fontFamily: "monospace", fontSize: "10px" }}>
                  &crarr;
                </kbd>{" "}
                Select
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <kbd style={{ padding: "1px 5px", borderRadius: "4px", border: `1px solid ${borderColor}`, fontFamily: "monospace", fontSize: "10px" }}>
                  Esc
                </kbd>{" "}
                Close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
