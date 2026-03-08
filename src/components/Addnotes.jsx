import { useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTag, FiChevronDown, FiSend, FiDroplet, FiMaximize, FiMinimize, FiLayout } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

const quickTags = [
  { name: "Personal", emoji: "\u{1F464}", color: "#3b82f6" },
  { name: "Work",     emoji: "\u{1F4BC}", color: "#f59e0b" },
  { name: "Ideas",    emoji: "\u{1F4A1}", color: "#8b5cf6" },
  { name: "Study",    emoji: "\u{1F4DA}", color: "#10b981" },
  { name: "Important",emoji: "\u{1F525}", color: "#ef4444" },
  { name: "Todo",     emoji: "\u2705",    color: "#ec4899" },
];

const colorPalette = [
  "#7c3aed", "#3b82f6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6",
  "#f97316", "#14b8a6", "#6366f1", "#84cc16",
];

const templates = [
  { name: "Meeting Notes", icon: "\u{1F4CB}", tag: "Work", color: "#f59e0b",
    title: "Meeting - [Topic]",
    desc: "Date: \nAttendees: \n\nAgenda:\n1. \n2. \n3. \n\nAction Items:\n- [ ] \n- [ ] \n\nNotes:\n" },
  { name: "Todo List", icon: "\u2705", tag: "Todo", color: "#ec4899",
    title: "Todo - [Date]",
    desc: "Priority Tasks:\n- [ ] \n- [ ] \n- [ ] \n\nSecondary:\n- [ ] \n- [ ] \n\nCompleted:\n- [x] " },
  { name: "Journal", icon: "\u{1F4D3}", tag: "Personal", color: "#3b82f6",
    title: "Journal - " + new Date().toLocaleDateString(),
    desc: "How I feel today:\n\n\nWhat happened:\n\n\nWhat I'm grateful for:\n1. \n2. \n3. \n\nGoals for tomorrow:\n" },
  { name: "Idea", icon: "\u{1F4A1}", tag: "Ideas", color: "#8b5cf6",
    title: "Idea: ",
    desc: "The Idea:\n\n\nWhy it matters:\n\n\nNext steps:\n1. \n2. \n3. " },
  { name: "Study Notes", icon: "\u{1F4DA}", tag: "Study", color: "#10b981",
    title: "Study - [Subject]",
    desc: "Topic: \n\nKey Concepts:\n- \n- \n\nImportant Points:\n1. \n2. \n\nQuestions:\n- \n\nResources:\n- " },
  { name: "Bug Report", icon: "\u{1F41B}", tag: "Work", color: "#ef4444",
    title: "Bug: ",
    desc: "Description:\n\n\nSteps to Reproduce:\n1. \n2. \n3. \n\nExpected:\n\n\nActual:\n\n\nEnvironment:\n" },
];

const dailyPrompts = [
  "What's the most important thing you learned today?",
  "Write about a problem you solved recently.",
  "What are 3 things you're grateful for right now?",
  "Describe your ideal productive day.",
  "What's one habit you want to build this month?",
  "Write about someone who inspired you recently.",
  "What would you do if you had no fear?",
  "Describe your biggest achievement this year.",
  "What's a skill you want to master?",
  "Write a letter to your future self.",
  "What makes you feel most creative?",
  "Describe your perfect workspace.",
  "What book changed your perspective?",
  "Write about a mistake that taught you something.",
  "What's one thing you'd change about your routine?",
];

const DRAFT_KEY = "inotebook-draft";

export default function Addnotes({ showAlert }) {
  const { addNote, notes } = useContext(noteContext);
  const { dark } = useTheme();
  const [note, setNote] = useState(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    return draft ? JSON.parse(draft) : { title: "", description: "", tag: "", color: "#7c3aed" };
  });
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(true);
  const [showColors, setShowColors] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const ref = useRef(null);

  // Daily prompt based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const dailyPrompt = dailyPrompts[dayOfYear % dailyPrompts.length];

  // Auto-save draft
  useEffect(() => {
    if (note.title || note.description) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(note));
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [note]);

  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault(); setOpen(true); ref.current?.focus();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // Milestone confetti
  const checkMilestone = (count) => {
    const milestones = [1, 5, 10, 25, 50, 100, 250, 500];
    if (milestones.includes(count)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      const msgs = {
        1: "Your first note! The journey begins!",
        5: "5 notes! You're on a roll!",
        10: "10 notes! Double digits!",
        25: "25 notes! Quarter century!",
        50: "50 notes! Halfway to 100!",
        100: "100 notes! A true note master!",
        250: "250 notes! Incredible dedication!",
        500: "500 notes! You're legendary!",
      };
      return msgs[count] || null;
    }
    return null;
  };

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    const ok = await addNote(note.title, note.description, note.tag, note.color);
    if (ok) {
      const milestone = checkMilestone(notes.length + 1);
      showAlert(milestone || "Note added!", "success");
      setNote({ title: "", description: "", tag: "", color: "#7c3aed" });
      localStorage.removeItem(DRAFT_KEY);
      if (zenMode) setZenMode(false);
    } else showAlert("Failed to add note", "danger");
    setBusy(false);
  };

  const applyTemplate = (t) => {
    setNote({ title: t.title, description: t.desc, tag: t.tag, color: t.color });
    setShowTemplates(false);
    ref.current?.focus();
  };

  const usePrompt = () => {
    setNote({ ...note, title: "Daily Reflection", description: dailyPrompt + "\n\n", tag: "Personal", color: "#3b82f6" });
    ref.current?.focus();
  };

  const valid = note.title.length >= 4 && note.description.length >= 5;
  const wordCount = note.description.trim().split(/\s+/).filter(Boolean).length;
  const charCount = note.description.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  // Zen mode - fullscreen editor
  if (zenMode) {
    return (
      <>
        {showConfetti && <Confetti />}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: dark ? "#050810" : "#fafbff" }}>
          <div className="w-full max-w-2xl px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold" style={{ color: txt }}>Focus Mode</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: muted }}>{wordCount}w / {readTime} min read</span>
                <button onClick={() => setZenMode(false)} className="p-2 cursor-pointer"
                  style={{ border: `1px solid ${dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.5)"}`,
                    borderRadius: 8, background: "transparent", color: muted }}>
                  <FiMinimize size={16} />
                </button>
              </div>
            </div>
            <form onSubmit={submit} className="space-y-6">
              <input value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })}
                placeholder="Title..." required minLength={4}
                className="w-full text-3xl font-bold outline-none"
                style={{ background: "transparent", border: "none", color: txt, padding: 0 }} />
              <textarea ref={ref} value={note.description} onChange={(e) => setNote({ ...note, description: e.target.value })}
                placeholder="Start writing..." required minLength={5} rows={12}
                className="w-full text-base leading-relaxed outline-none"
                style={{ background: "transparent", border: "none", color: sub, padding: 0, resize: "none" }} />
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: muted }}>
                  Press Esc to exit focus mode
                </span>
                <motion.button type="submit" disabled={!valid || busy}
                  whileHover={valid && !busy ? { scale: 1.03 } : {}}
                  whileTap={valid && !busy ? { scale: 0.97 } : {}}
                  className="btn-primary" style={{ padding: "10px 24px" }}>
                  <FiSend size={14} /> Save Note
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      {showConfetti && <Confetti />}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
        className="card overflow-hidden">

        {/* Color accent bar at top */}
        <div style={{ height: 3, background: `linear-gradient(to right, ${note.color}, ${note.color}88)` }} />

        {/* Header */}
        <button onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between p-5 cursor-pointer text-left ${open ? "pb-0" : ""}`}
          style={{ border: "none", background: "transparent" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: note.color, boxShadow: `0 4px 14px ${note.color}4D`, transition: "all 0.3s" }}>
              <FiPlus className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: txt }}>Add a Note</h2>
              <p className="text-xs" style={{ color: muted }}>
                {open ? "Capture your thoughts" : "Click or press Ctrl+N"}
              </p>
            </div>
          </div>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ color: muted }}>
            <FiChevronDown size={18} />
          </motion.span>
        </button>

        {/* Form */}
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
              <form onSubmit={submit} className="p-5 pt-4 space-y-4">

                {/* Daily Prompt */}
                <div className="p-3 rounded-xl cursor-pointer" onClick={usePrompt}
                  style={{ background: dark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.03)",
                    border: `1px solid ${dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.06)"}` }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: "#7c3aed" }}>Daily Prompt</p>
                  <p className="text-xs" style={{ color: sub }}>{dailyPrompt}</p>
                </div>

                {/* Templates */}
                <div>
                  <button type="button" onClick={() => setShowTemplates(!showTemplates)}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider cursor-pointer mb-2"
                    style={{ background: "transparent", border: "none", color: sub, padding: 0 }}>
                    <FiLayout size={12} /> Templates
                    <motion.span animate={{ rotate: showTemplates ? 180 : 0 }} style={{ display: "flex" }}>
                      <FiChevronDown size={12} />
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {showTemplates && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                          {templates.map((t) => (
                            <button key={t.name} type="button" onClick={() => applyTemplate(t)}
                              className="p-3 text-left cursor-pointer group"
                              style={{ background: dark ? "rgba(51,65,85,0.2)" : "rgba(241,245,249,0.6)",
                                border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                                borderRadius: 10, transition: "all 0.2s" }}>
                              <span className="text-lg mb-1 block">{t.icon}</span>
                              <span className="text-xs font-semibold block" style={{ color: txt }}>{t.name}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Title */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: sub }}>Title</label>
                    <span className="text-xs font-medium" style={{ color: note.title.length >= 4 ? "#10b981" : muted }}>
                      {note.title.length}/4
                    </span>
                  </div>
                  <input ref={ref} value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })}
                    placeholder="What's on your mind?" minLength={4} required className="input-modern" />
                </div>

                {/* Description */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: sub }}>Description</label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: muted }}>{wordCount}w {charCount}c ~{readTime}min</span>
                      <span className="text-xs font-medium" style={{ color: note.description.length >= 5 ? "#10b981" : muted }}>
                        {note.description.length}/5
                      </span>
                    </div>
                  </div>
                  <textarea value={note.description} onChange={(e) => setNote({ ...note, description: e.target.value })}
                    placeholder="Write your thoughts here..." minLength={5} required rows={3}
                    className="input-modern" style={{ resize: "none" }} />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2.5"
                    style={{ color: sub }}>
                    <FiTag size={12} /> Tag
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quickTags.map((t) => (
                      <motion.button key={t.name} type="button"
                        onClick={() => setNote({ ...note, tag: note.tag === t.name ? "" : t.name, color: t.color })}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className={`chip ${note.tag === t.name ? "chip-on" : "chip-off"}`}
                        style={note.tag === t.name ? { background: t.color, boxShadow: `0 3px 10px ${t.color}40` } : {}}>
                        {t.emoji} {t.name}
                      </motion.button>
                    ))}
                  </div>
                  <input value={note.tag} onChange={(e) => setNote({ ...note, tag: e.target.value })}
                    placeholder="Or type custom tag..." className="input-modern" />
                </div>

                {/* Color Picker */}
                <div>
                  <button type="button" onClick={() => setShowColors(!showColors)}
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                    style={{ background: "transparent", border: "none", color: sub, padding: 0 }}>
                    <FiDroplet size={12} /> Card Color
                    <span className="w-4 h-4 rounded-full" style={{ background: note.color, border: `2px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }} />
                  </button>
                  <AnimatePresence>
                    {showColors && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="flex flex-wrap gap-2 mt-3">
                          {colorPalette.map((c) => (
                            <button key={c} type="button" onClick={() => setNote({ ...note, color: c })}
                              className="cursor-pointer"
                              style={{
                                width: 28, height: 28, borderRadius: 8, background: c, border: "none",
                                outline: note.color === c ? `2px solid ${c}` : "none",
                                outlineOffset: 2, transform: note.color === c ? "scale(1.15)" : "scale(1)",
                                transition: "all 0.2s", boxShadow: `0 2px 8px ${c}40`,
                              }} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit row */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: muted }}>
                      <kbd style={{
                        padding: "2px 6px", borderRadius: 4, fontSize: 10,
                        background: dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.7)",
                        border: `1px solid ${dark ? "rgba(71,85,105,0.3)" : "rgba(203,213,225,0.5)"}`,
                      }}>Ctrl+N</kbd>
                    </span>
                    <button type="button" onClick={() => setZenMode(true)} title="Focus Mode"
                      className="p-1.5 cursor-pointer"
                      style={{ border: "none", background: "transparent", color: muted, borderRadius: 6 }}>
                      <FiMaximize size={14} />
                    </button>
                  </div>
                  <motion.button type="submit" disabled={!valid || busy}
                    whileHover={valid && !busy ? { scale: 1.03 } : {}}
                    whileTap={valid && !busy ? { scale: 0.97 } : {}}
                    className="btn-primary"
                    style={!(valid && !busy) ? {
                      background: dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.7)",
                      color: muted, boxShadow: "none",
                    } : { padding: "10px 20px" }}>
                    {busy ? (
                      <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Adding...</>
                    ) : (
                      <><FiSend size={14} /> Add Note</>
                    )}
                  </motion.button>
                </div>

                {/* Draft indicator */}
                {(note.title || note.description) && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#10b981" }}>Draft auto-saved</span>
                    <button type="button" onClick={() => { setNote({ title: "", description: "", tag: "", color: "#7c3aed" }); localStorage.removeItem(DRAFT_KEY); }}
                      className="text-xs font-medium cursor-pointer"
                      style={{ border: "none", background: "transparent", color: muted }}>
                      Clear draft
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// CSS-only confetti component
function Confetti() {
  const colors = ["#7c3aed", "#06b6d4", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none", overflow: "hidden" }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top: -20,
          width: Math.random() * 8 + 4,
          height: Math.random() * 8 + 4,
          background: colors[Math.floor(Math.random() * colors.length)],
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          animation: `confettiFall ${Math.random() * 2 + 2}s ease-in forwards`,
          animationDelay: `${Math.random() * 0.5}s`,
          opacity: Math.random() * 0.5 + 0.5,
          transform: `rotate(${Math.random() * 360}deg)`,
        }} />
      ))}
    </div>
  );
}
