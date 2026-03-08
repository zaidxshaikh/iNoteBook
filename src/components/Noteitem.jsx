import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2, FiTag, FiClock } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

const Noteitem = ({ note, updateNote, showAlert }) => {
  const { deleteNote } = useContext(noteContext);
  const { darkMode } = useTheme();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const tagColors = {
    personal: "from-blue-500 to-cyan-500",
    work: "from-orange-500 to-amber-500",
    ideas: "from-purple-500 to-pink-500",
    important: "from-red-500 to-rose-500",
    general: "from-primary-500 to-violet-500",
  };

  const getTagGradient = (tag) => {
    const key = (tag || "general").toLowerCase();
    return tagColors[key] || tagColors.general;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${
        darkMode
          ? "bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-primary-500/5"
          : "bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-200/50"
      }`}
    >
      {/* Tag */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getTagGradient(note.tag)}`}
        >
          <FiTag size={10} />
          {note.tag || "General"}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => updateNote(note)}
            className={`p-2 rounded-lg transition-all cursor-pointer border-none ${
              darkMode
                ? "hover:bg-slate-800 text-slate-400 hover:text-primary-400"
                : "hover:bg-gray-100 text-gray-400 hover:text-primary-500"
            }`}
            title="Edit note"
          >
            <FiEdit2 size={15} />
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className={`p-2 rounded-lg transition-all cursor-pointer border-none ${
              darkMode
                ? "hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                : "hover:bg-red-50 text-gray-400 hover:text-red-500"
            }`}
            title="Delete note"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <h3 className={`text-lg font-semibold mb-2 line-clamp-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
        {note.title}
      </h3>
      <p className={`text-sm leading-relaxed line-clamp-3 mb-4 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
        {note.description}
      </p>

      {/* Date */}
      <div className={`flex items-center gap-1.5 text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
        <FiClock size={12} />
        {formatDate(note.date)}
      </div>

      {/* Delete Confirmation */}
      {showConfirm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-xl border ${
            darkMode ? "bg-slate-800 border-slate-700" : "bg-gray-50 border-gray-200"
          }`}
        >
          <p className={`text-sm mb-3 ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
            Delete this note?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors cursor-pointer border-none"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border-none ${
                darkMode
                  ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
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
