import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiFileText, FiEdit3, FiGrid, FiList, FiFilter } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";
import Noteitem from "./Noteitem";
import Addnotes from "./Addnotes";
import { useNavigate } from "react-router-dom";

const Notes = ({ showAlert }) => {
  const { notes, getNotes, editNote, loading } = useContext(noteContext);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [filterTag, setFilterTag] = useState("all");
  const [currentNote, setCurrentNote] = useState({
    id: "",
    etitle: "",
    edescription: "",
    etag: "",
  });

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getNotes();
    } else {
      navigate("/login");
    }
  }, [getNotes, navigate]);

  const updateNote = (note) => {
    setCurrentNote({
      id: note._id,
      etitle: note.title,
      edescription: note.description,
      etag: note.tag,
    });
    setEditModal(true);
  };

  const handleUpdate = async () => {
    const success = await editNote(
      currentNote.id,
      currentNote.etitle,
      currentNote.edescription,
      currentNote.etag
    );
    if (success) {
      showAlert("Note updated successfully", "success");
    } else {
      showAlert("Failed to update note", "danger");
    }
    setEditModal(false);
  };

  const onChange = (e) => {
    setCurrentNote({ ...currentNote, [e.target.name]: e.target.value });
  };

  // Get unique tags
  const uniqueTags = [...new Set(notes.map((n) => n.tag || "General"))];

  // Filter and sort notes
  const processedNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.tag && note.tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTag = filterTag === "all" || (note.tag || "General") === filterTag;
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      // Pinned notes always on top
      if (a.tag === "Pinned" && b.tag !== "Pinned") return -1;
      if (b.tag === "Pinned" && a.tag !== "Pinned") return 1;

      switch (sortBy) {
        case "newest":
          return new Date(b.date) - new Date(a.date);
        case "oldest":
          return new Date(a.date) - new Date(b.date);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const isEditValid =
    currentNote.etitle.length >= 4 && currentNote.edescription.length >= 5;

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

  const chipStyle = (active) => ({
    border: "none",
    borderRadius: "8px",
    background: active ? "#6366f1" : (darkMode ? "#334155" : "#f1f5f9"),
    color: active ? "#ffffff" : (darkMode ? "#94a3b8" : "#64748b"),
    boxShadow: active ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
  });

  return (
    <>
      <Addnotes showAlert={showAlert} />

      {/* Header */}
      <div className="mt-10 mb-6">
        <div className="flex flex-col gap-4 mb-6">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: darkMode ? "#f1f5f9" : "#1e293b" }}>
                Your Notes
              </h2>
              <p className="text-sm mt-1" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                {processedNotes.length} of {notes.length} {notes.length === 1 ? "note" : "notes"}
              </p>
            </div>

            {notes.length > 0 && (
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div
                  className="flex items-center p-0.5"
                  style={{
                    background: darkMode ? "#334155" : "#f1f5f9",
                    borderRadius: "8px",
                  }}
                >
                  <button
                    onClick={() => setViewMode("grid")}
                    className="p-2 transition-all cursor-pointer"
                    style={{
                      border: "none",
                      borderRadius: "6px",
                      background: viewMode === "grid" ? "#6366f1" : "transparent",
                      color: viewMode === "grid" ? "#ffffff" : (darkMode ? "#94a3b8" : "#94a3b8"),
                      boxShadow: viewMode === "grid" ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
                    }}
                  >
                    <FiGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className="p-2 transition-all cursor-pointer"
                    style={{
                      border: "none",
                      borderRadius: "6px",
                      background: viewMode === "list" ? "#6366f1" : "transparent",
                      color: viewMode === "list" ? "#ffffff" : (darkMode ? "#94a3b8" : "#94a3b8"),
                      boxShadow: viewMode === "list" ? "0 2px 8px rgba(99,102,241,0.3)" : "none",
                    }}
                  >
                    <FiList size={16} />
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <FiSearch
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: darkMode ? "#64748b" : "#94a3b8",
                    }}
                    size={16}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notes..."
                    className="w-full py-2.5 text-sm transition-all duration-200 outline-none"
                    style={{
                      background: darkMode ? "#1e293b" : "#ffffff",
                      border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
                      borderRadius: "12px",
                      color: darkMode ? "#f1f5f9" : "#1e293b",
                      paddingLeft: "40px",
                      paddingRight: "40px",
                    }}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        border: "none",
                        background: "transparent",
                        color: darkMode ? "#64748b" : "#94a3b8",
                      }}
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Filter & Sort Row */}
          {notes.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Tag Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <FiFilter size={14} style={{ color: darkMode ? "#64748b" : "#94a3b8" }} />
                <button
                  onClick={() => setFilterTag("all")}
                  className="px-3 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                  style={chipStyle(filterTag === "all")}
                >
                  All
                </button>
                {uniqueTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className="px-3 py-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                    style={chipStyle(filterTag === tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 sm:ml-auto">
                <span className="text-xs" style={{ color: darkMode ? "#64748b" : "#94a3b8" }}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs px-3 py-1.5 cursor-pointer outline-none"
                  style={{
                    background: darkMode ? "#334155" : "#ffffff",
                    border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
                    borderRadius: "8px",
                    color: darkMode ? "#94a3b8" : "#64748b",
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
                Loading your notes...
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && notes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div
              className="w-20 h-20 flex items-center justify-center mb-4"
              style={{
                background: darkMode ? "#334155" : "#f1f5f9",
                borderRadius: "16px",
              }}
            >
              <FiFileText size={32} style={{ color: darkMode ? "#64748b" : "#94a3b8" }} />
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: darkMode ? "#94a3b8" : "#1e293b" }}>
              No notes yet
            </h3>
            <p className="text-sm" style={{ color: darkMode ? "#64748b" : "#94a3b8" }}>
              Create your first note above to get started
            </p>
          </motion.div>
        )}

        {/* Search Empty State */}
        {!loading && notes.length > 0 && processedNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <FiSearch size={32} style={{ color: darkMode ? "#64748b" : "#94a3b8" }} />
            <p className="text-sm mt-3" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
              No notes found
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterTag("all");
              }}
              className="mt-2 text-xs text-primary-500 hover:text-primary-600 cursor-pointer"
              style={{ border: "none", background: "transparent" }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Notes Grid/List */}
        {!loading && processedNotes.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col gap-3"
            }
          >
            <AnimatePresence>
              {processedNotes.map((note) => (
                <Noteitem
                  key={note._id}
                  note={note}
                  updateNote={updateNote}
                  showAlert={showAlert}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setEditModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg p-6"
              style={{
                background: darkMode ? "#1e293b" : "#ffffff",
                border: `1px solid ${darkMode ? "#475569" : "#c7d2fe"}`,
                borderRadius: "16px",
                boxShadow: darkMode ? "0 8px 40px rgba(0,0,0,0.5)" : "0 8px 40px rgba(99,102,241,0.12), 0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600"
                  style={{ borderRadius: "12px" }}
                >
                  <FiEdit3 className="text-white" size={18} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: darkMode ? "#f1f5f9" : "#1e293b" }}>
                  Edit Note
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: darkMode ? "#94a3b8" : "#1e293b" }}>
                    Title
                  </label>
                  <input
                    value={currentNote.etitle}
                    type="text"
                    name="etitle"
                    onChange={onChange}
                    minLength={4}
                    className="w-full py-3 transition-all duration-200 outline-none"
                    style={inputStyle}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: darkMode ? "#94a3b8" : "#1e293b" }}>
                    Description
                  </label>
                  <textarea
                    value={currentNote.edescription}
                    name="edescription"
                    onChange={onChange}
                    minLength={5}
                    rows={4}
                    className="w-full py-3 transition-all duration-200 outline-none resize-none"
                    style={inputStyle}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: darkMode ? "#94a3b8" : "#1e293b" }}>
                    Tag
                  </label>
                  <input
                    value={currentNote.etag}
                    type="text"
                    name="etag"
                    onChange={onChange}
                    className="w-full py-3 transition-all duration-200 outline-none"
                    style={inputStyle}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditModal(false)}
                  className="px-5 py-2.5 font-medium text-sm transition-all cursor-pointer"
                  style={{
                    background: darkMode ? "#334155" : "#f1f5f9",
                    color: darkMode ? "#94a3b8" : "#64748b",
                    border: "none",
                    borderRadius: "12px",
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={!isEditValid}
                  onClick={handleUpdate}
                  className={`px-5 py-2.5 font-medium text-sm transition-all cursor-pointer ${
                    isEditValid
                      ? "bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:shadow-lg hover:shadow-primary-500/25"
                      : "cursor-not-allowed"
                  }`}
                  style={{
                    border: "none",
                    borderRadius: "12px",
                    ...(isEditValid ? {} : {
                      background: darkMode ? "#334155" : "#f1f5f9",
                      color: darkMode ? "#64748b" : "#94a3b8",
                    }),
                  }}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Notes;
