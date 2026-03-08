import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiTag } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

const Addnotes = ({ showAlert }) => {
  const { addNote } = useContext(noteContext);
  const { darkMode } = useTheme();
  const [note, setNote] = useState({ title: "", description: "", tag: "" });
  const [submitting, setSubmitting] = useState(false);

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
      className={`rounded-2xl p-6 sm:p-8 ${
        darkMode
          ? "bg-slate-900/50 border border-slate-800"
          : "bg-white border border-gray-100 shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
          <FiPlus className="text-white" size={20} />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
            Add a Note
          </h2>
          <p className={`text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            Capture your thoughts and ideas
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
            Title
          </label>
          <input
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
          <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
            Description
          </label>
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
          <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
            <FiTag className="inline mr-1" size={14} />
            Tag
          </label>
          <input
            value={note.tag}
            type="text"
            name="tag"
            placeholder="e.g. Personal, Work, Ideas..."
            onChange={onChange}
            className={inputClass}
          />
        </div>

        <button
          disabled={!isValid || submitting}
          type="submit"
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer border-none ${
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
      </form>
    </motion.div>
  );
};

export default Addnotes;
