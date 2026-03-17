import { useContext, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiFileText,
  FiActivity,
  FiTarget,
  FiAward,
  FiBarChart2,
} from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

/* ── helpers ─────────────────────────────────────────────── */

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function charCount(text) {
  return text.length;
}

function dateKey(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function daysBetween(a, b) {
  const msDay = 86400000;
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((da - db) / msDay);
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ── main component ──────────────────────────────────────── */

export default function Analytics() {
  const { notes } = useContext(noteContext);
  const { dark } = useTheme();
  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = localStorage.getItem("analyticsGoal");
    return saved ? Number(saved) : 500;
  });

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";
  const cardBg = dark ? "rgba(30,41,59,0.5)" : "rgba(255,255,255,0.7)";
  const barBg = dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.5)";

  /* ── computed stats ────────────────────────────────────── */

  const stats = useMemo(() => {
    if (!notes.length) return null;

    const totalWords = notes.reduce((s, n) => s + wordCount(n.description), 0);
    const totalChars = notes.reduce((s, n) => s + charCount(n.description), 0);
    const avgWords = Math.round(totalWords / notes.length);

    // Words per date map
    const wordsPerDate = {};
    const notesPerDate = {};
    notes.forEach((n) => {
      const dk = dateKey(n.date);
      wordsPerDate[dk] = (wordsPerDate[dk] || 0) + wordCount(n.description);
      notesPerDate[dk] = (notesPerDate[dk] || 0) + 1;
    });

    // Unique active days
    const activeDays = Object.keys(notesPerDate).length;
    const avgPerDay = activeDays ? Math.round(totalWords / activeDays) : 0;

    // Longest note
    let longest = notes[0];
    let longestWc = 0;
    notes.forEach((n) => {
      const wc = wordCount(n.description);
      if (wc > longestWc) {
        longestWc = wc;
        longest = n;
      }
    });

    // Streaks (current + best)
    const sortedDates = [...new Set(notes.map((n) => dateKey(n.date)))].sort().reverse();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Current streak: from today going backwards
    const today = new Date();
    const todayKey = dateKey(today);
    const d = new Date(today);
    // Check if today or yesterday starts the streak
    if (sortedDates.includes(todayKey)) {
      for (let i = 0; i < 365; i++) {
        const dk = dateKey(d);
        if (sortedDates.includes(dk)) {
          currentStreak++;
          d.setDate(d.getDate() - 1);
        } else break;
      }
    } else {
      // Check if yesterday starts it
      d.setDate(d.getDate() - 1);
      for (let i = 0; i < 365; i++) {
        const dk = dateKey(d);
        if (sortedDates.includes(dk)) {
          currentStreak++;
          d.setDate(d.getDate() - 1);
        } else break;
      }
    }

    // Best streak: iterate all sorted dates
    const allDates = [...new Set(notes.map((n) => dateKey(n.date)))].sort();
    tempStreak = 1;
    for (let i = 1; i < allDates.length; i++) {
      const prev = new Date(allDates[i - 1]);
      const curr = new Date(allDates[i]);
      if (daysBetween(curr, prev) === 1) {
        tempStreak++;
      } else {
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak;

    // Last 30 days words
    const last30 = [];
    for (let i = 29; i >= 0; i--) {
      const dd = new Date();
      dd.setDate(dd.getDate() - i);
      const dk = dateKey(dd);
      last30.push({
        date: dk,
        label: `${MONTH_NAMES[dd.getMonth()]} ${dd.getDate()}`,
        shortLabel: `${dd.getDate()}`,
        words: wordsPerDate[dk] || 0,
      });
    }

    // Tag distribution
    const tagCounts = {};
    notes.forEach((n) => {
      const tag = n.tag || "General";
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    const tagList = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    // Monthly heatmap (last 3 months)
    const heatmapData = [];
    const heatStart = new Date();
    heatStart.setMonth(heatStart.getMonth() - 3);
    heatStart.setDate(1);
    // Go to Sunday of that week
    while (heatStart.getDay() !== 0) heatStart.setDate(heatStart.getDate() - 1);
    const heatEnd = new Date();
    const cursor = new Date(heatStart);
    while (cursor <= heatEnd) {
      const dk = dateKey(cursor);
      heatmapData.push({
        date: dk,
        count: notesPerDate[dk] || 0,
        month: cursor.getMonth(),
        day: cursor.getDay(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Most productive day of week
    const dayTotals = [0, 0, 0, 0, 0, 0, 0];
    notes.forEach((n) => {
      dayTotals[new Date(n.date).getDay()]++;
    });
    const bestDayIdx = dayTotals.indexOf(Math.max(...dayTotals));

    // Most used tag
    const mostUsedTag = tagList.length ? tagList[0].tag : "N/A";

    // Today's words for goal
    const todayWords = wordsPerDate[todayKey] || 0;

    return {
      totalNotes: notes.length,
      totalWords,
      totalChars,
      avgWords,
      avgPerDay,
      longest,
      longestWc,
      currentStreak,
      bestStreak,
      last30,
      tagList,
      heatmapData,
      bestDay: DAY_NAMES[bestDayIdx],
      bestDayCount: dayTotals[bestDayIdx],
      mostUsedTag,
      mostUsedTagCount: tagList.length ? tagList[0].count : 0,
      todayWords,
    };
  }, [notes]);

  /* ── goal handler ──────────────────────────────────────── */

  function handleGoalChange(e) {
    const val = Math.max(50, Number(e.target.value) || 50);
    setDailyGoal(val);
    localStorage.setItem("analyticsGoal", val);
  }

  /* ── rendering ─────────────────────────────────────────── */

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (!notes.length) {
    return (
      <div className="py-10" style={{ textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <FiBarChart2 size={48} style={{ color: muted, margin: "0 auto 16px" }} />
          <h2 className="text-xl font-bold" style={{ color: txt }}>No Analytics Yet</h2>
          <p className="text-sm" style={{ color: muted, marginTop: 8 }}>
            Start writing notes to see your writing statistics here.
          </p>
        </motion.div>
      </div>
    );
  }

  const goalPct = Math.min(100, Math.round((stats.todayWords / dailyGoal) * 100));
  const max30 = Math.max(1, ...stats.last30.map((d) => d.words));
  const maxTag = Math.max(1, ...stats.tagList.map((t) => t.count));
  const maxHeat = Math.max(1, ...stats.heatmapData.map((d) => d.count));

  function heatColor(count) {
    if (count === 0) return dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.6)";
    const intensity = count / maxHeat;
    if (intensity <= 0.25) return dark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.15)";
    if (intensity <= 0.5) return dark ? "rgba(124,58,237,0.4)" : "rgba(124,58,237,0.3)";
    if (intensity <= 0.75) return dark ? "rgba(124,58,237,0.65)" : "rgba(124,58,237,0.5)";
    return "#7c3aed";
  }

  // Group heatmap into weeks (columns)
  const heatWeeks = [];
  let week = [];
  stats.heatmapData.forEach((d, i) => {
    week.push(d);
    if (d.day === 6 || i === stats.heatmapData.length - 1) {
      heatWeeks.push(week);
      week = [];
    }
  });

  // Month labels for heatmap
  const monthLabels = [];
  let lastMonth = -1;
  heatWeeks.forEach((w, wi) => {
    const firstDay = w[0];
    if (firstDay && firstDay.month !== lastMonth) {
      monthLabels.push({ index: wi, label: MONTH_NAMES[firstDay.month] });
      lastMonth = firstDay.month;
    }
  });

  return (
    <div className="py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: txt }}>
          <FiBarChart2 className="inline mr-3" style={{ verticalAlign: "-4px" }} size={28} />
          Writing Analytics
        </h1>
        <p className="text-sm" style={{ color: muted }}>
          Track your writing habits and productivity
        </p>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
          gap: 16,
        }}
      >
        {/* ── Overview Stats ─────────────────────────────── */}
        <motion.div variants={fadeUp} className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(124,58,237,0.1)",
            }}>
              <FiFileText size={16} style={{ color: "#7c3aed" }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: txt }}>Overview</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Total Notes", value: stats.totalNotes },
              { label: "Total Words", value: stats.totalWords.toLocaleString() },
              { label: "Total Characters", value: stats.totalChars.toLocaleString() },
              { label: "Avg Note Length", value: `${stats.avgWords}w` },
              { label: "Avg Per Day", value: `${stats.avgPerDay}w` },
              { label: "Active Days", value: Object.keys(stats.last30.filter((d) => d.words > 0)).length },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "12px 8px", borderRadius: 10, textAlign: "center",
                background: dark ? "rgba(51,65,85,0.3)" : "rgba(241,245,249,0.8)",
              }}>
                <div className="text-lg font-bold" style={{ color: "#7c3aed" }}>{item.value}</div>
                <div style={{ fontSize: 11, color: sub, marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Streaks & Achievements ─────────────────────── */}
        <motion.div variants={fadeUp} className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(6,182,212,0.1)",
            }}>
              <FiAward size={16} style={{ color: "#06b6d4" }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: txt }}>Streaks & Highlights</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: sub }}>Current Streak</div>
                <div className="text-2xl font-bold" style={{ color: "#7c3aed" }}>
                  {stats.currentStreak} <span style={{ fontSize: 14, color: sub }}>days</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: sub }}>Best Streak</div>
                <div className="text-2xl font-bold" style={{ color: "#06b6d4" }}>
                  {stats.bestStreak} <span style={{ fontSize: 14, color: sub }}>days</span>
                </div>
              </div>
            </div>
            <div style={{
              padding: 14, borderRadius: 10,
              background: dark ? "rgba(51,65,85,0.3)" : "rgba(241,245,249,0.8)",
            }}>
              <div style={{ fontSize: 12, color: sub, marginBottom: 4 }}>Longest Note</div>
              <div className="font-bold text-sm" style={{ color: txt }}>
                {stats.longest.title}
              </div>
              <div style={{ fontSize: 12, color: "#7c3aed", marginTop: 2 }}>
                {stats.longestWc.toLocaleString()} words
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{
                flex: 1, padding: 14, borderRadius: 10,
                background: dark ? "rgba(51,65,85,0.3)" : "rgba(241,245,249,0.8)",
              }}>
                <div style={{ fontSize: 12, color: sub, marginBottom: 4 }}>Most Productive Day</div>
                <div className="font-bold" style={{ color: txt }}>{stats.bestDay}</div>
                <div style={{ fontSize: 11, color: muted }}>{stats.bestDayCount} notes</div>
              </div>
              <div style={{
                flex: 1, padding: 14, borderRadius: 10,
                background: dark ? "rgba(51,65,85,0.3)" : "rgba(241,245,249,0.8)",
              }}>
                <div style={{ fontSize: 12, color: sub, marginBottom: 4 }}>Most Used Tag</div>
                <div className="font-bold" style={{ color: txt }}>{stats.mostUsedTag}</div>
                <div style={{ fontSize: 11, color: muted }}>{stats.mostUsedTagCount} notes</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Words Per Day (Last 30 Days) ───────────────── */}
        <motion.div variants={fadeUp} className="card" style={{ padding: 24, gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(124,58,237,0.1)",
              }}>
                <FiTrendingUp size={16} style={{ color: "#7c3aed" }} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: txt }}>Words Per Day</h3>
            </div>
            <span style={{ fontSize: 12, color: muted }}>Last 30 days</span>
          </div>
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 3, height: 140,
            overflowX: "auto", paddingBottom: 24, position: "relative",
          }}>
            {stats.last30.map((d, i) => {
              const h = d.words > 0 ? Math.max(6, (d.words / max30) * 120) : 4;
              const isToday = i === 29;
              return (
                <div key={d.date} style={{
                  flex: "1 0 auto", minWidth: 14, maxWidth: 28,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                  {d.words > 0 && (
                    <span style={{ fontSize: 9, color: "#7c3aed", fontWeight: 600 }}>{d.words}</span>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    transition={{ delay: 0.3 + i * 0.02, type: "spring", stiffness: 180, damping: 18 }}
                    style={{
                      width: "100%", borderRadius: 4,
                      background: isToday
                        ? "linear-gradient(to top, #7c3aed, #a78bfa)"
                        : d.words > 0
                          ? (dark ? "rgba(124,58,237,0.35)" : "rgba(124,58,237,0.2)")
                          : barBg,
                    }}
                  />
                  {(i % 5 === 0 || isToday) && (
                    <span style={{
                      fontSize: 9, color: isToday ? "#7c3aed" : muted,
                      fontWeight: isToday ? 700 : 400, position: "absolute", bottom: 0,
                      transform: "translateX(0)",
                    }}>{d.shortLabel}</span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Notes Per Tag ──────────────────────────────── */}
        <motion.div variants={fadeUp} className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(6,182,212,0.1)",
            }}>
              <FiBarChart2 size={16} style={{ color: "#06b6d4" }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: txt }}>Notes Per Tag</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stats.tagList.map((t, i) => (
              <div key={t.tag}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: txt, fontWeight: 600 }}>{t.tag}</span>
                  <span style={{ fontSize: 12, color: muted }}>{t.count}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: barBg, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(t.count / maxTag) * 100}%` }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                    style={{
                      height: "100%", borderRadius: 4,
                      background: `linear-gradient(90deg, #7c3aed, #06b6d4)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Writing Goal ───────────────────────────────── */}
        <motion.div variants={fadeUp} className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(124,58,237,0.1)",
            }}>
              <FiTarget size={16} style={{ color: "#7c3aed" }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: txt }}>Daily Writing Goal</h3>
          </div>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div className="text-3xl font-bold" style={{ color: goalPct >= 100 ? "#10b981" : "#7c3aed" }}>
              {goalPct}%
            </div>
            <div style={{ fontSize: 12, color: sub, marginTop: 4 }}>
              {stats.todayWords.toLocaleString()} / {dailyGoal.toLocaleString()} words today
            </div>
          </div>
          <div style={{
            height: 12, borderRadius: 6, background: barBg, overflow: "hidden", marginBottom: 16,
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalPct}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              style={{
                height: "100%", borderRadius: 6,
                background: goalPct >= 100
                  ? "linear-gradient(90deg, #10b981, #06b6d4)"
                  : "linear-gradient(90deg, #7c3aed, #a78bfa)",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ fontSize: 12, color: sub, whiteSpace: "nowrap" }}>Target:</label>
            <input
              type="number"
              min={50}
              step={50}
              value={dailyGoal}
              onChange={handleGoalChange}
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
                background: dark ? "rgba(51,65,85,0.4)" : "rgba(241,245,249,0.8)",
                color: txt, fontSize: 13, outline: "none",
              }}
            />
            <span style={{ fontSize: 12, color: muted }}>words/day</span>
          </div>
        </motion.div>

        {/* ── Monthly Activity Heatmap ───────────────────── */}
        <motion.div variants={fadeUp} className="card" style={{ padding: 24, gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(124,58,237,0.1)",
              }}>
                <FiActivity size={16} style={{ color: "#7c3aed" }} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: txt }}>Activity Heatmap</h3>
            </div>
            <span style={{ fontSize: 12, color: muted }}>Last 3 months</span>
          </div>

          {/* Month labels */}
          <div style={{
            display: "flex", gap: 0, marginBottom: 6, paddingLeft: 28, overflow: "hidden",
          }}>
            {monthLabels.map((ml) => (
              <span key={`${ml.label}-${ml.index}`} style={{
                fontSize: 10, color: muted, position: "relative",
                left: ml.index * 14,
                marginRight: -ml.index * 14 + 14,
              }}>
                {ml.label}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 0 }}>
            {/* Day labels */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 2, marginRight: 6,
              justifyContent: "flex-start",
            }}>
              {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
                <div key={i} style={{ height: 12, fontSize: 9, color: muted, lineHeight: "12px" }}>
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div style={{
              display: "flex", gap: 2, overflowX: "auto",
            }}>
              {heatWeeks.map((w, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Pad incomplete first week */}
                  {wi === 0 && w[0] && Array.from({ length: w[0].day }).map((_, pi) => (
                    <div key={`pad-${pi}`} style={{ width: 12, height: 12 }} />
                  ))}
                  {w.map((d) => (
                    <motion.div
                      key={d.date}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 + wi * 0.015, duration: 0.2 }}
                      title={`${d.date}: ${d.count} note${d.count !== 1 ? "s" : ""}`}
                      style={{
                        width: 12, height: 12, borderRadius: 3,
                        background: heatColor(d.count),
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4, marginTop: 12, justifyContent: "flex-end",
          }}>
            <span style={{ fontSize: 10, color: muted, marginRight: 4 }}>Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
              <div key={intensity} style={{
                width: 12, height: 12, borderRadius: 3,
                background: heatColor(intensity === 0 ? 0 : Math.ceil(intensity * maxHeat)),
              }} />
            ))}
            <span style={{ fontSize: 10, color: muted, marginLeft: 4 }}>More</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
