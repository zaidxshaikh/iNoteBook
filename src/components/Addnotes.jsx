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

  const inputStyle = {
    background: darkMode ? "#1e293b" : "#f8fafc",
    border: `1px solid ${darkMode ? "#475569" : "#d1d5db"}`,
    borderRadius: "12px",
    color: darkMode ? "#f1f5f9" : "#1e293b",
    paddingLeft: "16px",
    paddingRight: "16px",
  };

  const inputFocusHandler = (e) => {
    e.target.style.borderColor = "#6366f1";
    e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)";
  };

  const inputBlurHandler = (e) => {
    e.target.style.borderColor = darkMode ? "#475569" : "#d1d5db";
    e.target.style.boxShadow = "none";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden"
      style={{
        background: darkMode ? "#1e293b" : "#ffffff",
        border: `1px solid ${darkMode ? "#475569" : "#c7d2fe"}`,
        borderRadius: "16px",
        boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(99,102,241,0.08), 0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header - clickable to toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-6 cursor-pointer text-left ${
          expanded ? "pb-0" : ""
        }`}
        style={{ border: "none", background: "transparent" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600"
            style={{ borderRadius: "12px" }}
          >
            <FiPlus className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: darkMode ? "#f1f5f9" : "#1e293b" }}>
              Add a Note
            </h2>
            <p className="text-sm" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
              {expanded ? "Capture your thoughts" : "Click to expand  |  Ctrl+N"}
            </p>
          </div>
        </div>
        <span style={{ color: darkMode ? "#94a3b8" : "#94a3b8" }}>
          {expanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </span>
      </button>

      {/* Form */}
      <AnimatePresenceWrapper show={expanded}>
        <div className="p-6 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: darkMode ? "#94a3b8" : "#1e293b" }}>
                  Title
                </label>
                <span className="text-xs" style={{ color: note.title.length >= 4 ? "#10b981" : (darkMode ? "#64748b" : "#94a3b8") }}>
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
                className="w-full py-3 transition-all duration-200 outline-none"
                style={inputStyle}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium" style={{ color: darkMode ? "#94a3b8" : "#1e293b" }}>
                  Description
                </label>
                <span className="text-xs" style={{ color: note.description.length >= 5 ? "#10b981" : (darkMode ? "#64748b" : "#94a3b8") }}>
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
                className="w-full py-3 transition-all duration-200 outline-none resize-none"
                style={inputStyle}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: darkMode ? "#94a3b8" : "#1e293b" }}>
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
                    className="px-3 py-1.5 text-xs font-medium transition-all cursor-pointer"
                    style={{
                      border: "none",
                      borderRadius: "8px",
                      background: note.tag === tag
                        ? "#6366f1"
                        : (darkMode ? "#334155" : "#f1f5f9"),
                      color: note.tag === tag
                        ? "#ffffff"
                        : (darkMode ? "#94a3b8" : "#64748b"),
                      boxShadow: note.tag === tag ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
                    }}
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
                className="w-full py-3 transition-all duration-200 outline-none"
                style={inputStyle}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs" style={{ color: darkMode ? "#64748b" : "#94a3b8" }}>
                Ctrl+N to quick focus
              </p>
              <button
                disabled={!isValid || submitting}
                type="submit"
                className={`px-6 py-3 font-semibold text-sm transition-all duration-200 cursor-pointer ${
                  isValid && !submitting
                    ? "bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5"
                    : "cursor-not-allowed"
                }`}
                style={{
                  border: "none",
                  borderRadius: "12px",
                  ...(!(isValid && !submitting) ? {
                    background: darkMode ? "#334155" : "#f1f5f9",
                    color: darkMode ? "#64748b" : "#94a3b8",
                  } : {}),
                }}
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
