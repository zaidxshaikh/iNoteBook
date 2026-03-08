import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiClock, FiCopy, FiCheck, FiStar, FiMaximize2, FiX, FiShare2, FiBell } from "react-icons/fi";
import { HiDuplicate } from "react-icons/hi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

const accentMap = {
  pinned: "accent-pinned", personal: "accent-personal", work: "accent-work",
  ideas: "accent-ideas", important: "accent-important", study: "accent-study",
  todo: "accent-todo", general: "accent-general",
};
const dotColorMap = {
  pinned: "#eab308", personal: "#3b82f6", work: "#f59e0b",
  ideas: "#8b5cf6", important: "#ef4444", study: "#10b981",
  todo: "#ec4899", general: "#7c3aed",
};

export default function Noteitem({ note, updateNote, showAlert, selectable, selected, onSelect, notifications }) {
  const { deleteNote, editNote, duplicateNote } = useContext(noteContext);
  const { dark } = useTheme();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [shareMenu, setShareMenu] = useState(false);
  const [reminderMenu, setReminderMenu] = useState(false);
  const [customReminder, setCustomReminder] = useState("");

  const doDelete = async () => {
    setDeleting(true);
    const ok = await deleteNote(note._id);
    showAlert(ok ? "Moved to trash" : "Failed to delete", ok ? "success" : "danger");
    setDeleting(false); setConfirm(false);
  };

  const doCopy = () => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.description}`);
    setCopied(true);
    showAlert("Copied!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const doPin = async () => {
    const tag = note.tag === "Pinned" ? "General" : "Pinned";
    const ok = await editNote(note._id, note.title, note.description, tag, note.color);
    if (ok) showAlert(tag === "Pinned" ? "Pinned" : "Unpinned", "success");
  };

  const doDuplicate = async () => {
    const ok = await duplicateNote(note);
    showAlert(ok ? "Note duplicated!" : "Failed to duplicate", ok ? "success" : "danger");
  };

  const doShareText = () => {
    const text = `${note.title}\n\n${note.description}\n\n---\nShared from iNotebook`;
    navigator.clipboard.writeText(text);
    showAlert("Note copied for sharing!", "success");
    setShareMenu(false);
  };

  const doShareMarkdown = () => {
    const md = `# ${note.title}\n\n> Tag: ${note.tag || "General"}\n\n${note.description}\n\n---\n*Shared from iNotebook*`;
    navigator.clipboard.writeText(md);
    showAlert("Markdown copied!", "success");
    setShareMenu(false);
  };

  const doShareEmail = () => {
    const subject = encodeURIComponent(note.title);
    const body = encodeURIComponent(`${note.description}\n\n---\nShared from iNotebook`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setShareMenu(false);
  };

  const setReminder = async (minutes) => {
    if (!notifications) return;
    if (notifications.permission !== "granted") {
      const p = await notifications.requestPermission();
      if (p !== "granted") { showAlert("Please allow notifications", "danger"); return; }
    }
    const remindAt = new Date(Date.now() + minutes * 60000).toISOString();
    notifications.addReminder(note._id, note.title, note.description, remindAt);
    const label = minutes < 60 ? `${minutes}m` : minutes < 1440 ? `${minutes / 60}h` : `${minutes / 1440}d`;
    showAlert(`Reminder set for ${label} from now!`, "success");
    setReminderMenu(false);
  };

  const setCustomReminderFn = async () => {
    if (!customReminder || !notifications) return;
    if (notifications.permission !== "granted") {
      const p = await notifications.requestPermission();
      if (p !== "granted") { showAlert("Please allow notifications", "danger"); return; }
    }
    const remindAt = new Date(customReminder).toISOString();
    if (new Date(remindAt) <= new Date()) { showAlert("Please pick a future time", "danger"); return; }
    notifications.addReminder(note._id, note.title, note.description, remindAt);
    showAlert("Custom reminder set!", "success");
    setReminderMenu(false);
    setCustomReminder("");
  };

  const noteReminders = notifications ? notifications.getRemindersForNote(note._id) : [];

  const fmt = (d) => {
    const ms = Date.now() - new Date(d);
    const m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), dy = Math.floor(ms / 86400000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (dy < 7) return `${dy}d ago`;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const wordCount = note.description.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const pinned = note.tag === "Pinned";
  const key = (note.tag || "general").toLowerCase();
  const accent = accentMap[key] || accentMap.general;
  const dot = note.color || dotColorMap[key] || dotColorMap.general;
  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className={`group note-card ${accent}`}
      >
        {/* Custom color accent */}
        {note.color && (
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
            borderRadius: "4px 0 0 4px",
            background: `linear-gradient(to bottom, ${note.color}, ${note.color}88)`,
            zIndex: 2,
          }} />
        )}

        <div className="p-5 pl-7">
          {/* Selectable checkbox */}
          {selectable && (
            <div className="absolute top-3 left-3 z-10">
              <input type="checkbox" checked={selected} onChange={() => onSelect(note._id)}
                style={{ width: 18, height: 18, borderRadius: 6, cursor: "pointer", accentColor: "#7c3aed" }} />
            </div>
          )}

          {/* Pin badge */}
          {pinned && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#eab308,#f59e0b)", boxShadow: "0 3px 10px rgba(234,179,8,0.35)" }}>
                <FiStar size={11} className="text-white" style={{ fill: "white" }} />
              </div>
            </motion.div>
          )}

          {/* Tag + meta */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: dot }}>
              {note.tag || "General"}
            </span>
            <span className="text-xs ml-auto" style={{ color: muted }}>{wordCount}w ~{readTime}min</span>
          </div>

          {/* Content */}
          <h3 className="text-base font-bold mb-1.5 line-clamp-1 pr-8" style={{ color: txt }}>{note.title}</h3>
          <p className="text-sm leading-relaxed line-clamp-3 mb-4 whitespace-pre-wrap" style={{ color: sub }}>
            {note.description}
          </p>

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs" style={{ color: muted }}>
              <FiClock size={12} /> {fmt(note.date)}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative">
              {[
                { fn: () => setExpanded(true), icon: <FiMaximize2 size={14} />, c: muted, tip: "Expand" },
                { fn: doPin, icon: <FiStar size={14} style={pinned ? { fill: "#eab308" } : {}} />, c: pinned ? "#eab308" : muted, tip: "Pin" },
                { fn: doDuplicate, icon: <HiDuplicate size={15} />, c: muted, tip: "Duplicate" },
                { fn: doCopy, icon: copied ? <FiCheck size={14} /> : <FiCopy size={14} />, c: copied ? "#10b981" : muted, tip: "Copy" },
                { fn: () => { setReminderMenu(!reminderMenu); setShareMenu(false); }, icon: <FiBell size={14} />, c: noteReminders.length > 0 ? "#f59e0b" : reminderMenu ? "#7c3aed" : muted, tip: "Remind" },
                { fn: () => { setShareMenu(!shareMenu); setReminderMenu(false); }, icon: <FiShare2 size={14} />, c: shareMenu ? "#7c3aed" : muted, tip: "Share" },
                { fn: () => updateNote(note), icon: <FiEdit2 size={14} />, c: muted, tip: "Edit" },
                { fn: () => setConfirm(true), icon: <FiTrash2 size={14} />, c: muted, tip: "Delete" },
              ].map((a, i) => (
                <button key={i} onClick={a.fn} title={a.tip}
                  className="p-1.5 cursor-pointer hover:scale-110 transition-transform"
                  style={{ border: "none", background: "transparent", borderRadius: 6, color: a.c }}>
                  {a.icon}
                </button>
              ))}

              {/* Reminder dropdown */}
              <AnimatePresence>
                {reminderMenu && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 bottom-full mb-2 z-20"
                    style={{ minWidth: 200 }}>
                    <div className="card p-2" style={{ borderRadius: 10 }}>
                      <p className="text-xs font-semibold px-2 py-1 mb-1" style={{ color: txt }}>Remind me in...</p>
                      {[
                        { label: "5 minutes", min: 5 },
                        { label: "15 minutes", min: 15 },
                        { label: "30 minutes", min: 30 },
                        { label: "1 hour", min: 60 },
                        { label: "3 hours", min: 180 },
                        { label: "Tomorrow", min: 1440 },
                      ].map((opt) => (
                        <button key={opt.min} onClick={() => setReminder(opt.min)}
                          className="w-full text-left px-3 py-1.5 text-xs font-medium cursor-pointer flex items-center gap-2"
                          style={{ border: "none", borderRadius: 6, background: "transparent", color: sub }}>
                          <FiClock size={11} /> {opt.label}
                        </button>
                      ))}
                      <div className="border-t mt-1 pt-1" style={{ borderColor: dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)" }}>
                        <div className="flex gap-1 px-1">
                          <input type="datetime-local" value={customReminder}
                            onChange={(e) => setCustomReminder(e.target.value)}
                            className="flex-1 text-xs px-2 py-1 outline-none"
                            style={{ background: dark ? "rgba(30,41,59,0.6)" : "rgba(241,245,249,0.8)",
                              border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                              borderRadius: 6, color: sub }} />
                          <button onClick={setCustomReminderFn}
                            className="px-2 py-1 text-xs font-semibold cursor-pointer"
                            style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6 }}>
                            Set
                          </button>
                        </div>
                      </div>
                      {noteReminders.length > 0 && (
                        <div className="mt-2 px-2">
                          <p className="text-xs font-semibold mb-1" style={{ color: "#f59e0b" }}>
                            Active: {noteReminders.length} reminder{noteReminders.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Share dropdown */}
              <AnimatePresence>
                {shareMenu && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 bottom-full mb-2 z-20"
                    style={{ minWidth: 160 }}>
                    <div className="card p-1.5" style={{ borderRadius: 10 }}>
                      <button onClick={doShareText}
                        className="w-full text-left px-3 py-2 text-xs font-medium cursor-pointer flex items-center gap-2"
                        style={{ border: "none", borderRadius: 6, background: "transparent", color: sub }}>
                        <FiCopy size={12} /> Copy as Text
                      </button>
                      <button onClick={doShareMarkdown}
                        className="w-full text-left px-3 py-2 text-xs font-medium cursor-pointer flex items-center gap-2"
                        style={{ border: "none", borderRadius: 6, background: "transparent", color: sub }}>
                        <FiShare2 size={12} /> Copy as Markdown
                      </button>
                      <button onClick={doShareEmail}
                        className="w-full text-left px-3 py-2 text-xs font-medium cursor-pointer flex items-center gap-2"
                        style={{ border: "none", borderRadius: 6, background: "transparent", color: sub }}>
                        <FiMaximize2 size={12} /> Share via Email
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Delete confirm */}
          <AnimatePresence>
            {confirm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4" style={{ borderTop: `1px solid ${dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.6)"}` }}>
                <p className="text-xs font-medium mb-3" style={{ color: sub }}>Move to trash?</p>
                <div className="flex gap-2">
                  <button onClick={doDelete} disabled={deleting}
                    className="px-3 py-1.5 text-white text-xs font-semibold cursor-pointer"
                    style={{ background: "#ef4444", border: "none", borderRadius: 8, boxShadow: "0 2px 8px rgba(239,68,68,0.25)" }}>
                    {deleting ? "..." : "Delete"}
                  </button>
                  <button onClick={() => setConfirm(false)}
                    className="px-3 py-1.5 text-xs font-semibold cursor-pointer"
                    style={{ background: dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.7)", color: sub, border: "none", borderRadius: 8 }}>
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Expand Modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            onClick={() => setExpanded(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl card"
              style={{ maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
              {/* Color bar */}
              <div style={{ height: 4, background: `linear-gradient(to right, ${dot}, ${dot}88)`, borderRadius: "20px 20px 0 0" }} />

              <div className="p-6 sm:p-8 overflow-y-auto">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} />
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: dot }}>
                      {note.tag || "General"}
                    </span>
                    <span className="text-xs" style={{ color: muted }}>{wordCount} words ~{readTime} min read</span>
                  </div>
                  <button onClick={() => setExpanded(false)} className="p-1.5 cursor-pointer"
                    style={{ border: "none", background: "transparent", color: muted }}>
                    <FiX size={18} />
                  </button>
                </div>

                <h2 className="text-2xl font-bold mb-4" style={{ color: txt }}>{note.title}</h2>
                <p className="text-sm leading-loose whitespace-pre-wrap" style={{ color: sub }}>{note.description}</p>

                <div className="flex items-center gap-4 mt-6 pt-4"
                  style={{ borderTop: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}` }}>
                  <span className="text-xs" style={{ color: muted }}>
                    <FiClock size={12} className="inline mr-1.5" style={{ verticalAlign: "-2px" }} />
                    {new Date(note.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </span>
                  <span className="text-xs" style={{ color: muted }}>
                    {note.description.length} chars
                  </span>
                </div>

                {/* Quick actions in expanded view */}
                <div className="flex items-center gap-2 mt-4">
                  <button onClick={doCopy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
                    style={{ background: dark ? "rgba(51,65,85,0.3)" : "rgba(241,245,249,0.8)",
                      border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                      borderRadius: 8, color: sub }}>
                    <FiCopy size={12} /> Copy
                  </button>
                  <button onClick={doShareText} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
                    style={{ background: dark ? "rgba(51,65,85,0.3)" : "rgba(241,245,249,0.8)",
                      border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                      borderRadius: 8, color: sub }}>
                    <FiShare2 size={12} /> Share
                  </button>
                  <button onClick={doDuplicate} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold cursor-pointer"
                    style={{ background: dark ? "rgba(51,65,85,0.3)" : "rgba(241,245,249,0.8)",
                      border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                      borderRadius: 8, color: sub }}>
                    <HiDuplicate size={12} /> Duplicate
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
