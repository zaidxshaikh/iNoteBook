import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiFileText, FiEdit3 } from "react-icons/fi";
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

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.tag && note.tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isEditValid =
    currentNote.etitle.length >= 4 && currentNote.edescription.length >= 5;

  const inputClass = `w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none ${
    darkMode
      ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
  }`;

  return (
    <>
      <Addnotes showAlert={showAlert} />

      {/* Search & Header */}
      <div className="mt-10 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Your Notes
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              {notes.length} {notes.length === 1 ? "note" : "notes"} total
            </p>
          </div>

          {notes.length > 0 && (
            <div className="relative w-full sm:w-72">
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
        {!loading && notes.length > 0 && filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <FiSearch size={32} className={darkMode ? "text-slate-600" : "text-gray-300"} />
            <p className={`text-sm mt-3 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              No notes matching &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {/* Notes Grid */}
        {!loading && filteredNotes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredNotes.map((note) => (
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
