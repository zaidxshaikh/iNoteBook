import { useContext } from "react";
import { motion } from "framer-motion";
import { FiFileText, FiTag, FiStar, FiActivity, FiTrendingUp, FiClock } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";
import Notes from "./Notes";

const statCfg = [
  { key: "total",  icon: <FiFileText size={20} />,  label: "Total Notes", bg: "linear-gradient(135deg,#7c3aed,#6366f1)" },
  { key: "tags",   icon: <FiTag size={20} />,       label: "Categories",  bg: "linear-gradient(135deg,#06b6d4,#3b82f6)" },
  { key: "pinned", icon: <FiStar size={20} />,      label: "Pinned",      bg: "linear-gradient(135deg,#f59e0b,#ef4444)" },
  { key: "today",  icon: <FiActivity size={20} />,  label: "Today",       bg: "linear-gradient(135deg,#10b981,#06b6d4)" },
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekActivity(notes) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    days.push({
      day: dayNames[d.getDay()],
      date: d.getDate(),
      count: notes.filter((n) => new Date(n.date).toDateString() === ds).length,
      isToday: i === 0,
    });
  }
  return days;
}

function getStreak(notes) {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const ds = d.toDateString();
    if (notes.some((n) => new Date(n.date).toDateString() === ds)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

function getTotalWords(notes) {
  return notes.reduce((sum, n) => sum + n.description.trim().split(/\s+/).filter(Boolean).length, 0);
}

export default function Home({ showAlert, notifications }) {
  const { notes } = useContext(noteContext);
  const { dark } = useTheme();
  const loggedIn = !!localStorage.getItem("token");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const today = new Date().toDateString();

  const vals = {
    total:  notes.length,
    tags:   [...new Set(notes.map((n) => n.tag || "General"))].length,
    pinned: notes.filter((n) => n.tag === "Pinned").length,
    today:  notes.filter((n) => new Date(n.date).toDateString() === today).length,
  };

  const weekActivity = getWeekActivity(notes);
  const maxCount = Math.max(1, ...weekActivity.map((d) => d.count));
  const streak = getStreak(notes);
  const totalWords = getTotalWords(notes);

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  return (
    <div className="py-8">
      {loggedIn && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-1" style={{ color: txt }}>
            {greeting} <span className="text-gradient-warm">!</span>
          </h1>
          <p className="text-sm mb-8" style={{ color: muted }}>
            Here&apos;s what&apos;s happening with your notes
          </p>

          {notes.length > 0 && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {statCfg.map((s, i) => (
                  <motion.div key={s.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.08 }}
                    className="stat-card"
                    style={{ background: s.bg }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.2)" }}>
                        {s.icon}
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{vals[s.key]}</p>
                        <p className="text-xs font-medium" style={{ opacity: 0.8 }}>{s.label}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Activity + Stats row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Weekly Activity Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="card p-5 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FiTrendingUp size={16} style={{ color: "#7c3aed" }} />
                      <h3 className="text-sm font-bold" style={{ color: txt }}>Weekly Activity</h3>
                    </div>
                    <span className="text-xs" style={{ color: muted }}>Last 7 days</span>
                  </div>
                  <div className="flex items-end justify-between gap-2" style={{ height: 100 }}>
                    {weekActivity.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-xs font-bold" style={{ color: d.count > 0 ? "#7c3aed" : "transparent" }}>
                          {d.count}
                        </span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(4, (d.count / maxCount) * 60)}px` }}
                          transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 200 }}
                          style={{
                            width: "100%", maxWidth: 32, borderRadius: 6,
                            background: d.isToday
                              ? "linear-gradient(to top, #7c3aed, #a78bfa)"
                              : d.count > 0
                                ? (dark ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.15)")
                                : (dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"),
                          }}
                        />
                        <span className="text-xs" style={{
                          color: d.isToday ? "#7c3aed" : muted,
                          fontWeight: d.isToday ? 700 : 400,
                        }}>{d.day}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Quick stats */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="card p-5 flex flex-col justify-between">
                  <h3 className="text-sm font-bold mb-4" style={{ color: txt }}>Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "rgba(124,58,237,0.1)" }}>
                          <FiTrendingUp size={14} style={{ color: "#7c3aed" }} />
                        </div>
                        <span className="text-xs" style={{ color: sub }}>Streak</span>
                      </div>
                      <span className="text-lg font-bold" style={{ color: txt }}>{streak}d</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "rgba(6,182,212,0.1)" }}>
                          <FiFileText size={14} style={{ color: "#06b6d4" }} />
                        </div>
                        <span className="text-xs" style={{ color: sub }}>Total Words</span>
                      </div>
                      <span className="text-lg font-bold" style={{ color: txt }}>{totalWords.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "rgba(16,185,129,0.1)" }}>
                          <FiClock size={14} style={{ color: "#10b981" }} />
                        </div>
                        <span className="text-xs" style={{ color: sub }}>Avg Length</span>
                      </div>
                      <span className="text-lg font-bold" style={{ color: txt }}>
                        {notes.length ? Math.round(totalWords / notes.length) : 0}w
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      )}

      <Notes showAlert={showAlert} notifications={notifications} />
    </div>
  );
}
