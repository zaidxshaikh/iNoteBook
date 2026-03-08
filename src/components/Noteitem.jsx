import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2, FiTag, FiClock, FiCopy, FiCheck, FiStar } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

const Noteitem = ({ note, updateNote, showAlert }) => {
  const { deleteNote, editNote } = useContext(noteContext);
  const { darkMode } = useTheme();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const success = await deleteNote(note._id);
    if (success) {
      showAlert("Note deleted successfully", "success");
    } else {
      showAlert("Failed to delete note", "danger");
    }
    setDeleting(false);
    setShowConfirm(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.description}`);
    setCopied(true);
    showAlert("Copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePin = async () => {
    const newTag = note.tag === "Pinned" ? "General" : "Pinned";
    const success = await editNote(note._id, note.title, note.description, newTag);
    if (success) {
      showAlert(newTag === "Pinned" ? "Note pinned" : "Note unpinned", "success");
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const tagColors = {
    pinned: "from-yellow-500 to-orange-500",
    personal: "from-blue-500 to-cyan-500",
    work: "from-orange-500 to-amber-500",
    ideas: "from-purple-500 to-pink-500",
    important: "from-red-500 to-rose-500",
    general: "from-primary-500 to-violet-500",
    study: "from-emerald-500 to-teal-500",
    todo: "from-pink-500 to-rose-500",
  };

  const getTagGradient = (tag) => {
    const key = (tag || "general").toLowerCase();
    return tagColors[key] || tagColors.general;
  };

  const isPinned = note.tag === "Pinned";

  const cardStyle = isPinned
    ? {
        background: darkMode ? "rgba(234,179,8,0.05)" : "#fefce8",
        border: `2px solid ${darkMode ? "rgba(234,179,8,0.2)" : "#fde68a"}`,
        borderRadius: "16px",
      }
    : {
        background: darkMode ? "#1e293b" : "#ffffff",
        border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
        borderRadius: "16px",
        boxShadow: darkMode ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
      };

  const actionBtnStyle = (hoverBg, hoverColor) => ({
    border: "none",
    background: "transparent",
    cursor: "pointer",
    borderRadius: "8px",
    color: darkMode ? "#94a3b8" : "#94a3b8",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="group relative p-5 transition-all duration-300 hover:-translate-y-1"
      style={cardStyle}
    >
      {/* Pin indicator */}
      {isPinned && (
        <div className="absolute -top-2 -right-2">
          <span
            className="flex h-5 w-5 items-center justify-center"
            style={{
              borderRadius: "50%",
              background: "#eab308",
              boxShadow: "0 4px 12px rgba(234,179,8,0.4)",
            }}
          >
            <FiStar size={10} className="text-white fill-white" />
          </span>
        </div>
      )}

      {/* Tag & Actions Row */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-gradient-to-r ${getTagGradient(note.tag)}`}
          style={{ borderRadius: "9999px" }}
        >
          <FiTag size={10} />
          {note.tag || "General"}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handlePin}
            className="p-2 transition-all cursor-pointer"
            style={{
              ...actionBtnStyle(),
              color: isPinned ? "#eab308" : (darkMode ? "#94a3b8" : "#94a3b8"),
            }}
            title={isPinned ? "Unpin note" : "Pin note"}
          >
            <FiStar size={15} className={isPinned ? "fill-yellow-500" : ""} />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 transition-all cursor-pointer"
            style={actionBtnStyle()}
            title="Copy to clipboard"
          >
            {copied ? <FiCheck size={15} style={{ color: "#10b981" }} /> : <FiCopy size={15} />}
          </button>
          <button
            onClick={() => updateNote(note)}
            className="p-2 transition-all cursor-pointer"
            style={actionBtnStyle()}
            title="Edit note"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="p-2 transition-all cursor-pointer"
            style={actionBtnStyle()}
            title="Delete note"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold mb-2 line-clamp-1" style={{ color: darkMode ? "#f1f5f9" : "#1e293b" }}>
        {note.title}
      </h3>
      <p className="text-sm leading-relaxed line-clamp-3 mb-4 whitespace-pre-wrap" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
        {note.description}
      </p>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs" style={{ color: darkMode ? "#64748b" : "#94a3b8" }}>
        <FiClock size={12} />
        {formatDate(note.date)}
      </div>

      {/* Delete Confirmation */}
      {showConfirm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3"
          style={{
            background: darkMode ? "#334155" : "#f8fafc",
            border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
            borderRadius: "12px",
          }}
        >
          <p className="text-sm mb-3" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
            Delete this note permanently?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-white text-xs font-medium transition-colors cursor-pointer"
              style={{ background: "#ef4444", border: "none", borderRadius: "8px" }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
              style={{
                background: darkMode ? "#475569" : "#e2e8f0",
                color: darkMode ? "#94a3b8" : "#64748b",
                border: "none",
                borderRadius: "8px",
              }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Noteitem;
