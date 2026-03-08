import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiTrash2, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

export default function Reminders({ showAlert, notifications }) {
  const { notes } = useContext(noteContext);
  const { dark } = useTheme();
  const { upcomingReminders, reminders, removeReminder, clearFired, permission, requestPermission } = notifications;

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  const firedReminders = reminders.filter((r) => r.fired);

  const fmt = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (diff < 0) return "Overdue";
    if (mins < 1) return "Any moment now";
    if (mins < 60) return `In ${mins}m`;
    if (hours < 24) return `In ${hours}h ${mins % 60}m`;
    if (days < 7) return `In ${days}d`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const fmtFull = (d) => {
    return new Date(d).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: txt }}>
              <FiBell className="inline mr-3" style={{ verticalAlign: "-4px" }} size={28} />
              Reminders
            </h1>
            <p className="text-sm" style={{ color: muted }}>
              {upcomingReminders.length} upcoming reminder{upcomingReminders.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {permission !== "granted" && (
              <button onClick={async () => {
                const p = await requestPermission();
                showAlert(p === "granted" ? "Notifications enabled!" : "Notifications blocked", p === "granted" ? "success" : "danger");
              }}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold cursor-pointer"
                style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10,
                  boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
                <FiBell size={14} /> Enable Notifications
              </button>
            )}
            {firedReminders.length > 0 && (
              <button onClick={() => { clearFired(); showAlert("Cleared completed reminders", "success"); }}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold cursor-pointer"
                style={{ background: dark ? "rgba(51,65,85,0.3)" : "rgba(241,245,249,0.8)",
                  color: sub, border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                  borderRadius: 10 }}>
                <FiCheckCircle size={14} /> Clear Completed
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Notification permission status */}
      {permission !== "granted" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="card p-5 mb-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(245,158,11,0.1)" }}>
            <FiAlertCircle size={20} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold mb-1" style={{ color: txt }}>Enable Notifications</h3>
            <p className="text-xs leading-relaxed" style={{ color: sub }}>
              Allow notifications to receive reminders even when iNotebook is in the background.
              On mobile, install iNotebook as an app (Add to Home Screen) for the best notification experience.
            </p>
          </div>
        </motion.div>
      )}

      {/* Upcoming */}
      {upcomingReminders.length > 0 ? (
        <div className="space-y-3 mb-10">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: sub }}>Upcoming</h3>
          <AnimatePresence mode="popLayout">
            {upcomingReminders.map((r, i) => {
              const note = notes.find((n) => n._id === r.noteId);
              const isOverdue = new Date(r.remindAt).getTime() < Date.now();
              return (
                <motion.div key={r.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: isOverdue ? "rgba(239,68,68,0.1)" : "rgba(124,58,237,0.1)" }}>
                    <FiBell size={18} style={{ color: isOverdue ? "#ef4444" : "#7c3aed" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate" style={{ color: txt }}>{r.title}</h4>
                    <p className="text-xs truncate" style={{ color: sub }}>{r.description.slice(0, 80)}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs font-semibold"
                        style={{ color: isOverdue ? "#ef4444" : "#7c3aed" }}>
                        <FiClock size={11} /> {fmt(r.remindAt)}
                      </span>
                      <span className="text-xs" style={{ color: muted }}>{fmtFull(r.remindAt)}</span>
                    </div>
                  </div>
                  <button onClick={() => { removeReminder(r.id); showAlert("Reminder removed", "success"); }}
                    className="p-2 cursor-pointer shrink-0"
                    style={{ border: "none", background: "transparent", color: muted }}>
                    <FiTrash2 size={16} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-24">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: dark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)",
              border: `1px solid ${dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)"}` }}>
            <FiBell size={36} style={{ color: "#7c3aed" }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: txt }}>No Reminders</h3>
          <p className="text-sm text-center max-w-xs" style={{ color: muted }}>
            Set reminders on your notes to get notified at the right time
          </p>
        </motion.div>
      )}

      {/* Completed */}
      {firedReminders.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: muted }}>Completed</h3>
          <div className="space-y-2">
            {firedReminders.map((r) => (
              <div key={r.id} className="card p-3 flex items-center gap-3" style={{ opacity: 0.5 }}>
                <FiCheckCircle size={16} style={{ color: "#10b981" }} />
                <span className="text-sm flex-1 truncate" style={{ color: sub, textDecoration: "line-through" }}>{r.title}</span>
                <span className="text-xs" style={{ color: muted }}>{fmtFull(r.remindAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
