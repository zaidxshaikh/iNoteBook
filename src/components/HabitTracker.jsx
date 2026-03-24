import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTrash2, FiTrendingUp, FiCheck, FiTarget } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const STORAGE_KEY = "inotebook-habits";

const PRESET_COLORS = ["#7c3aed", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#f97316", "#06b6d4"];

const DEFAULT_HABITS = [
  { id: "default-1", name: "Write Daily", emoji: "\u{1f4dd}", color: "#7c3aed", completions: {} },
  { id: "default-2", name: "Exercise", emoji: "\u{1f4aa}", color: "#ef4444", completions: {} },
  { id: "default-3", name: "Read", emoji: "\u{1f4da}", color: "#3b82f6", completions: {} },
];

function getDateStr(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function getDayLabel(daysAgo) {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getShortDayLabel(daysAgo) {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yday";
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function calcStreak(completions) {
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const dateStr = getDateStr(i);
    if (completions[dateStr]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function HabitTracker({ showAlert }) {
  const { dark } = useTheme();

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  const [habits, setHabits] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_HABITS;
  });

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("\u{1f3af}");
  const [newColor, setNewColor] = useState("#7c3aed");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const [visibleDays, setVisibleDays] = useState(7);

  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      if (expanded) {
        setVisibleDays(30);
      } else if (w >= 1024) {
        setVisibleDays(14);
      } else if (w >= 768) {
        setVisibleDays(10);
      } else {
        setVisibleDays(7);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [expanded]);

  const toggleCompletion = useCallback((habitId, dateStr) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const next = { ...h, completions: { ...h.completions } };
        if (next.completions[dateStr]) {
          delete next.completions[dateStr];
        } else {
          next.completions[dateStr] = true;
        }
        return next;
      })
    );
  }, []);

  const addHabit = () => {
    const name = newName.trim();
    if (!name) {
      showAlert("Please enter a habit name", "danger");
      return;
    }
    const habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      emoji: newEmoji || "\u{1f3af}",
      color: newColor,
      completions: {},
    };
    setHabits((prev) => [...prev, habit]);
    setNewName("");
    setNewEmoji("\u{1f3af}");
    setNewColor("#7c3aed");
    setShowForm(false);
    showAlert("Habit added!", "success");
  };

  const deleteHabit = (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    showAlert("Habit deleted", "success");
  };

  const todayStr = getDateStr(0);
  const todayTotal = habits.length;
  const todayDone = habits.filter((h) => h.completions[todayStr]).length;
  const todayPct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  const days = Array.from({ length: visibleDays }, (_, i) => i);

  const cardBg = dark ? "rgba(30,41,59,0.5)" : "rgba(255,255,255,0.8)";
  const cardBorder = dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)";
  const inputBg = dark ? "rgba(15,23,42,0.6)" : "rgba(241,245,249,0.8)";

  return (
    <div className="py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: txt }}>
              <FiTarget className="inline mr-3" style={{ verticalAlign: "-4px" }} size={28} />
              Habit Tracker
            </h1>
            <p className="text-sm" style={{ color: muted }}>
              {todayDone}/{todayTotal} completed today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold cursor-pointer"
              style={{
                background: dark ? "rgba(51,65,85,0.3)" : "rgba(241,245,249,0.8)",
                color: sub,
                border: `1px solid ${cardBorder}`,
                borderRadius: 10,
              }}
            >
              {expanded ? "7 Days" : "30 Days"}
            </button>
            <button
              onClick={() => setShowForm((s) => !s)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold cursor-pointer"
              style={{
                background: "#7c3aed",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
              }}
            >
              <FiPlus size={14} /> Add Habit
            </button>
          </div>
        </div>
      </motion.div>

      {/* Today's progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(124,58,237,0.1)" }}
            >
              <FiTrendingUp size={20} style={{ color: "#7c3aed" }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: txt }}>Today's Progress</h3>
              <p className="text-xs" style={{ color: sub }}>
                {todayPct}% complete
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold" style={{ color: "#7c3aed" }}>
            {todayPct}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.8)",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${todayPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              height: "100%",
              borderRadius: 3,
              background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
            }}
          />
        </div>
      </motion.div>

      {/* Add Habit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="card p-5 mb-6"
            >
              <h3 className="text-sm font-bold mb-4" style={{ color: txt }}>New Habit</h3>
              <div className="flex flex-wrap gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Habit name..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHabit()}
                  className="flex-1 px-3 py-2 text-sm"
                  style={{
                    background: inputBg,
                    color: txt,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 10,
                    outline: "none",
                    minWidth: 160,
                  }}
                />
                <input
                  type="text"
                  placeholder="Emoji"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  className="px-3 py-2 text-sm text-center"
                  style={{
                    background: inputBg,
                    color: txt,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 10,
                    outline: "none",
                    width: 60,
                  }}
                />
              </div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-xs font-semibold" style={{ color: sub }}>Color:</span>
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className="cursor-pointer"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: c,
                      border: newColor === c ? "3px solid " + txt : "2px solid transparent",
                      padding: 0,
                      transition: "border 0.15s",
                    }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addHabit}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold cursor-pointer"
                  style={{
                    background: "#7c3aed",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
                  }}
                >
                  <FiCheck size={14} /> Add
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-semibold cursor-pointer"
                  style={{
                    background: dark ? "rgba(51,65,85,0.3)" : "rgba(241,245,249,0.8)",
                    color: sub,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 10,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits Grid */}
      {habits.length > 0 ? (
        <div className="space-y-3">
          {/* Day headers */}
          <div className="flex items-center gap-2" style={{ paddingLeft: 0 }}>
            <div style={{ minWidth: 160, flexShrink: 0 }} />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${visibleDays}, 1fr)`,
                gap: 4,
                flex: 1,
                minWidth: 0,
              }}
            >
              {days.map((daysAgo) => (
                <div
                  key={daysAgo}
                  className="text-center"
                  style={{ fontSize: 10, color: muted, fontWeight: 600 }}
                  title={getDayLabel(daysAgo)}
                >
                  {getShortDayLabel(daysAgo)}
                </div>
              ))}
            </div>
            <div style={{ width: 36, flexShrink: 0 }} />
          </div>

          <AnimatePresence mode="popLayout">
            {habits.map((habit, idx) => {
              const streak = calcStreak(habit.completions);
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  transition={{ delay: idx * 0.03 }}
                  className="card p-4 flex items-center gap-2"
                >
                  {/* Habit info */}
                  <div style={{ minWidth: 160, flexShrink: 0 }} className="flex items-center gap-2">
                    <span style={{ fontSize: 20 }}>{habit.emoji}</span>
                    <div className="min-w-0">
                      <h4
                        className="text-sm font-bold truncate"
                        style={{ color: txt, maxWidth: 120 }}
                      >
                        {habit.name}
                      </h4>
                      {streak > 0 && (
                        <span
                          className="flex items-center gap-1"
                          style={{ fontSize: 10, color: habit.color, fontWeight: 700 }}
                        >
                          <FiTrendingUp size={10} />
                          {streak} day{streak !== 1 ? "s" : ""} streak
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Day cells */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${visibleDays}, 1fr)`,
                      gap: 4,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {days.map((daysAgo) => {
                      const dateStr = getDateStr(daysAgo);
                      const done = !!habit.completions[dateStr];
                      return (
                        <motion.button
                          key={daysAgo}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => toggleCompletion(habit.id, dateStr)}
                          title={`${getDayLabel(daysAgo)} - ${done ? "Done" : "Not done"}`}
                          className="cursor-pointer flex items-center justify-center"
                          style={{
                            width: "100%",
                            aspectRatio: "1",
                            maxWidth: 32,
                            maxHeight: 32,
                            margin: "0 auto",
                            borderRadius: "50%",
                            border: done ? "none" : `2px solid ${dark ? "rgba(51,65,85,0.5)" : "rgba(203,213,225,0.8)"}`,
                            background: done ? habit.color : "transparent",
                            padding: 0,
                            transition: "background 0.2s, border 0.2s, box-shadow 0.2s",
                            boxShadow: done ? `0 2px 8px ${habit.color}44` : "none",
                          }}
                        >
                          {done && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            >
                              <FiCheck size={14} style={{ color: "#fff", strokeWidth: 3 }} />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 cursor-pointer shrink-0"
                    style={{ border: "none", background: "transparent", color: muted, borderRadius: 8 }}
                    title="Delete habit"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-24"
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: dark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)",
              border: `1px solid ${dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)"}`,
            }}
          >
            <FiTarget size={36} style={{ color: "#7c3aed" }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: txt }}>No Habits Yet</h3>
          <p className="text-sm text-center max-w-xs" style={{ color: muted }}>
            Start building positive habits by adding your first one above
          </p>
        </motion.div>
      )}
    </div>
  );
}
