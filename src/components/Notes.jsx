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

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none ${
    darkMode
      ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
  }`;

  const chipClass = (active) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border-none whitespace-nowrap ${
      active
        ? "bg-primary-500 text-white shadow-sm"
        : darkMode
        ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
    }`;

  return (
    <>
      <Addnotes showAlert={showAlert} />

      {/* Header */}
      <div className="mt-10 mb-6">
        <div className="flex flex-col gap-4 mb-6">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Your Notes
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
                {processedNotes.length} of {notes.length} {notes.length === 1 ? "note" : "notes"}
              </p>
            </div>

            {notes.length > 0 && (
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className={`flex items-center rounded-lg p-0.5 ${darkMode ? "bg-slate-800" : "bg-gray-100"}`}>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all cursor-pointer border-none ${
                      viewMode === "grid"
                        ? "bg-primary-500 text-white shadow-sm"
                        : darkMode
                        ? "text-slate-400 hover:text-white"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <FiGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all cursor-pointer border-none ${
                      viewMode === "list"
                        ? "bg-primary-500 text-white shadow-sm"
                        : darkMode
                        ? "text-slate-400 hover:text-white"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <FiList size={16} />
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <FiSearch
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      darkMode ? "text-slate-500" : "text-gray-400"
                    }`}
                    size={16}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notes..."
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none ${
                      darkMode
                        ? "bg-slate-900/50 border-slate-800 text-white placeholder-slate-500 focus:border-primary-500"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent ${
                        darkMode ? "text-slate-500" : "text-gray-400"
                      }`}
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
                <FiFilter size={14} className={darkMode ? "text-slate-500" : "text-gray-400"} />
                <button onClick={() => setFilterTag("all")} className={chipClass(filterTag === "all")}>
                  All
                </button>
                {uniqueTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={chipClass(filterTag === tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 sm:ml-auto">
                <span className={`text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer outline-none ${
                    darkMode
                      ? "bg-slate-800 border-slate-700 text-slate-300"
                      : "bg-white border-gray-200 text-gray-600"
                  }`}
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
              <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
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
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${
              darkMode ? "bg-slate-800" : "bg-gray-100"
            }`}>
              <FiFileText size={32} className={darkMode ? "text-slate-600" : "text-gray-300"} />
            </div>
            <h3 className={`text-lg font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
              No notes yet
            </h3>
            <p className={`text-sm ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
              Create your first note above to get started
            </p>
          </motion.div>
        )}

        {/* Search Empty State */}
        {!loading && notes.length > 0 && processedNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <FiSearch size={32} className={darkMode ? "text-slate-600" : "text-gray-300"} />
            <p className={`text-sm mt-3 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              No notes found
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterTag("all");
              }}
              className="mt-2 text-xs text-primary-500 hover:text-primary-600 cursor-pointer border-none bg-transparent"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${
                darkMode
                  ? "bg-slate-900 border border-slate-800"
                  : "bg-white border border-gray-100"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                  <FiEdit3 className="text-white" size={18} />
                </div>
                <h3 className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Edit Note
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                    Title
                  </label>
                  <input
                    value={currentNote.etitle}
                    type="text"
                    name="etitle"
                    onChange={onChange}
                    minLength={4}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                    Description
                  </label>
                  <textarea
                    value={currentNote.edescription}
                    name="edescription"
                    onChange={onChange}
                    minLength={5}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                    Tag
                  </label>
                  <input
                    value={currentNote.etag}
                    type="text"
                    name="etag"
                    onChange={onChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer border-none ${
                    darkMode
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  disabled={!isEditValid}
                  onClick={handleUpdate}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer border-none ${
                    isEditValid
                      ? "bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:shadow-lg hover:shadow-primary-500/25"
                      : darkMode
                      ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
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
