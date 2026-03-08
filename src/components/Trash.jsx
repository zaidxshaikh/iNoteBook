import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiRotateCcw, FiAlertTriangle, FiClock } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

export default function Trash({ showAlert }) {
  const { trash, restoreNote, emptyTrash } = useContext(noteContext);
  const { dark } = useTheme();

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  const doRestore = (id) => {
    const ok = restoreNote(id);
    showAlert(ok ? "Note restored!" : "Failed to restore", ok ? "success" : "danger");
  };

  const doEmpty = () => {
    emptyTrash();
    showAlert("Trash emptied", "success");
  };

  const fmt = (d) => {
    const ms = Date.now() - new Date(d);
    const m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), dy = Math.floor(ms / 86400000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (dy < 7) return `${dy}d ago`;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: txt }}>
              <FiTrash2 className="inline mr-3" style={{ verticalAlign: "-4px" }} size={28} />
              Trash
            </h1>
            <p className="text-sm" style={{ color: muted }}>
              {trash.length} deleted {trash.length === 1 ? "note" : "notes"}
            </p>
          </div>
          {trash.length > 0 && (
            <button onClick={doEmpty}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold cursor-pointer"
              style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444",
                border: `1px solid rgba(239,68,68,0.15)`, borderRadius: 10 }}>
              <FiAlertTriangle size={14} /> Empty Trash
            </button>
          )}
        </div>
      </motion.div>

      {trash.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-24">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: dark ? "rgba(100,116,139,0.08)" : "rgba(100,116,139,0.05)",
              border: `1px solid ${dark ? "rgba(100,116,139,0.12)" : "rgba(100,116,139,0.08)"}` }}>
            <FiTrash2 size={36} style={{ color: muted }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: txt }}>Trash is empty</h3>
          <p className="text-sm text-center max-w-xs" style={{ color: muted }}>
            Deleted notes will appear here
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {trash.map((n, i) => (
              <motion.div key={n._id + i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="note-card" style={{ opacity: 0.75 }}>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full" style={{ background: muted }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: muted }}>
                      {n.tag || "General"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold mb-1.5 line-clamp-1" style={{ color: txt, textDecoration: "line-through", opacity: 0.6 }}>
                    {n.title}
                  </h3>
                  <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: sub }}>{n.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: muted }}>
                      <FiClock size={12} /> Deleted {fmt(n.deletedAt)}
                    </span>
                    <button onClick={() => doRestore(n._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
                      style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}>
                      <FiRotateCcw size={12} /> Restore
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
