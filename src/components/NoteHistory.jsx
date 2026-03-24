import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiX, FiRotateCcw } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const HISTORY_KEY = "inotebook-history";

export function getHistory() {
  const s = localStorage.getItem(HISTORY_KEY);
  return s ? JSON.parse(s) : {};
}

export function saveVersion(noteId, note) {
  const history = getHistory();
  if (!history[noteId]) history[noteId] = [];
  history[noteId].unshift({
    title: note.title,
    description: note.description,
    tag: note.tag,
    savedAt: new Date().toISOString(),
  });
  // Keep max 20 versions per note
  history[noteId] = history[noteId].slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getVersions(noteId) {
  return getHistory()[noteId] || [];
}

export default function NoteHistory({ noteId, onRestore, onClose }) {
  const { dark } = useTheme();
  const versions = getVersions(noteId);
  const [selected, setSelected] = useState(null);

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  const fmt = (d) => {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const doRestore = (version) => {
    if (onRestore) onRestore(version);
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl card"
        style={{ maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.1)" }}>
              <FiClock size={18} style={{ color: "#7c3aed" }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: txt }}>Version History</h3>
              <p className="text-xs" style={{ color: muted }}>{versions.length} saved versions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 cursor-pointer"
            style={{ border: "none", background: "transparent", color: muted }}>
            <FiX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ display: "flex", gap: 16 }}>
          {/* Version list */}
          <div className="w-48 shrink-0 space-y-1.5" style={{ minWidth: 180 }}>
            {versions.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: muted }}>No history yet</p>
            ) : (
              versions.map((v, i) => (
                <button key={i} onClick={() => setSelected(i)}
                  className="w-full text-left p-3 cursor-pointer"
                  style={{
                    border: "none", borderRadius: 10,
                    background: selected === i ? "rgba(124,58,237,0.08)" : "transparent",
                    transition: "background 0.15s",
                  }}>
                  <p className="text-xs font-semibold truncate" style={{ color: selected === i ? "#7c3aed" : txt }}>
                    {v.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: muted }}>{fmt(v.savedAt)}</p>
                </button>
              ))
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 min-w-0">
            {selected !== null && versions[selected] ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold" style={{ color: txt }}>{versions[selected].title}</h4>
                  <button onClick={() => doRestore(versions[selected])}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
                    style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}>
                    <FiRotateCcw size={12} /> Restore
                  </button>
                </div>
                <div className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={{
                    background: dark ? "rgba(30,41,59,0.4)" : "rgba(241,245,249,0.6)",
                    border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                    color: sub, maxHeight: 400, overflowY: "auto",
                  }}>
                  {versions[selected].description}
                </div>
                <p className="text-xs mt-2" style={{ color: muted }}>
                  Tag: {versions[selected].tag || "General"} • {fmt(versions[selected].savedAt)}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs" style={{ color: muted }}>Select a version to preview</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
