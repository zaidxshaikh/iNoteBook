import { useContext, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiTag, FiChevronDown, FiChevronUp } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

const quickTags = ["Personal", "Work", "Ideas", "Study", "Important", "Todo"];

const Addnotes = ({ showAlert }) => {
  const { addNote } = useContext(noteContext);
  const { darkMode } = useTheme();
  const [note, setNote] = useState({ title: "", description: "", tag: "" });
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const titleRef = useRef(null);

  // Keyboard shortcut: Ctrl+N to focus title input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        setExpanded(true);
        titleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await addNote(note.title, note.description, note.tag);
    if (success) {
      showAlert("Note added successfully", "success");
      setNote({ title: "", description: "", tag: "" });
    } else {
      showAlert("Failed to add note", "danger");
    }
    setSubmitting(false);
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  const selectTag = (tag) => {
    setNote({ ...note, tag: note.tag === tag ? "" : tag });
  };

  const isValid = note.title.length >= 4 && note.description.length >= 5;

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none ${
    darkMode
      ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
  }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl overflow-hidden ${
        darkMode
          ? "bg-slate-900/50 border border-slate-800"
          : "bg-white border border-gray-100 shadow-sm"
      }`}
    >
      {/* Header - clickable to toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-6 cursor-pointer border-none bg-transparent text-left ${
          expanded ? "pb-0" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <FiPlus className="text-white" size={20} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Add a Note
            </h2>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              {expanded ? "Capture your thoughts" : "Click to expand  |  Ctrl+N"}
            </p>
          </div>
        </div>
        <span className={darkMode ? "text-slate-400" : "text-gray-400"}>
          {expanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </span>
      </button>

      {/* Form */}
      <AnimatePresenceWrapper show={expanded}>
        <div className="p-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                  Title
                </label>
                <span className={`text-xs ${note.title.length >= 4 ? "text-emerald-500" : darkMode ? "text-slate-500" : "text-gray-400"}`}>
                  {note.title.length}/4 min
                </span>
              </div>
              <input
                ref={titleRef}
                value={note.title}
                type="text"
                name="title"
                placeholder="Enter note title..."
                onChange={onChange}
                minLength={4}
                required
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                  Description
                </label>
                <span className={`text-xs ${note.description.length >= 5 ? "text-emerald-500" : darkMode ? "text-slate-500" : "text-gray-400"}`}>
                  {note.description.length}/5 min
                </span>
              </div>
              <textarea
                value={note.description}
                name="description"
                placeholder="Write your note description..."
                onChange={onChange}
                minLength={5}
                required
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                <FiTag className="inline mr-1" size={14} />
                Tag
              </label>

              {/* Quick Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => selectTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none ${
                      note.tag === tag
                        ? "bg-primary-500 text-white shadow-sm"
                        : darkMode
                        ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <input
                value={note.tag}
                type="text"
                name="tag"
                placeholder="Or type a custom tag..."
                onChange={onChange}
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className={`text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                Ctrl+N to quick focus
              </p>
              <button
                disabled={!isValid || submitting}
                type="submit"
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer border-none ${
                  isValid && !submitting
                    ? "bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5"
                    : darkMode
                    ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiPlus size={16} />
                    Add Note
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </AnimatePresenceWrapper>
    </motion.div>
  );
};

// Simple wrapper for expand/collapse animation
const AnimatePresenceWrapper = ({ show, children }) => {
  if (!show) return null;
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default Addnotes;
