import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlay,
  FiPause,
  FiRefreshCw,
  FiSkipForward,
  FiSettings,
  FiCoffee,
  FiClock,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const SETTINGS_KEY = "inotebook-pomodoro-settings";
const STATS_KEY = "inotebook-pomodoro-stats";

const DEFAULT_SETTINGS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
};

const MODE_LABELS = {
  work: "Focus",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayKey()) return parsed;
    }
  } catch {}
  return { date: todayKey(), focusedMinutes: 0, sessions: 0 };
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
    // second beep
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1100, ctx.currentTime + 0.3);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.1);
    osc2.start(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 1.1);
  } catch {}
}

function sendNotification(title, body) {
  try {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((p) => {
        if (p === "granted") new Notification(title, { body });
      });
    }
  } catch {}
}

const RADIUS = 90;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SVG_SIZE = 220;

export default function PomodoroTimer({ showAlert }) {
  const { dark } = useTheme();
  const [settings, setSettings] = useState(loadSettings);
  const [mode, setMode] = useState("work"); // work | shortBreak | longBreak
  const [totalSeconds, setTotalSeconds] = useState(settings.work * 60);
  const [secondsLeft, setSecondsLeft] = useState(settings.work * 60);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(1);
  const [stats, setStats] = useState(loadStats);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const intervalRef = useRef(null);

  // colours
  const primary = "#7c3aed";
  const orange = "#f59e0b";
  const green = "#10b981";
  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const cardBg = dark ? "rgba(30,30,40,0.85)" : "rgba(255,255,255,0.9)";

  const modeColor = mode === "work" ? orange : green;
  const ringGradientId = "pomodoroGrad";

  // refresh stats if date changed
  useEffect(() => {
    const s = loadStats();
    setStats(s);
  }, []);

  // timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // handle timer end
  useEffect(() => {
    if (secondsLeft === 0 && running) {
      setRunning(false);
      playBeep();
      if (mode === "work") {
        const newStats = {
          ...stats,
          date: todayKey(),
          focusedMinutes: stats.focusedMinutes + settings.work,
          sessions: stats.sessions + 1,
        };
        setStats(newStats);
        saveStats(newStats);

        if (session % settings.longBreakInterval === 0) {
          sendNotification(
            "Pomodoro Complete!",
            `Great work! Time for a long break.`
          );
          if (showAlert)
            showAlert(
              "Pomodoro complete! Time for a long break.",
              "success"
            );
          switchMode("longBreak");
        } else {
          sendNotification(
            "Pomodoro Complete!",
            `Nice! Take a short break.`
          );
          if (showAlert)
            showAlert("Pomodoro complete! Take a short break.", "success");
          switchMode("shortBreak");
        }
        setSession((s) => s + 1);
      } else {
        sendNotification("Break Over!", "Ready to focus again?");
        if (showAlert) showAlert("Break over! Ready to focus?", "info");
        switchMode("work");
      }
    }
    // eslint-disable-next-line
  }, [secondsLeft]);

  const switchMode = useCallback(
    (newMode) => {
      const dur =
        newMode === "work"
          ? settings.work
          : newMode === "shortBreak"
          ? settings.shortBreak
          : settings.longBreak;
      setMode(newMode);
      setTotalSeconds(dur * 60);
      setSecondsLeft(dur * 60);
      setRunning(false);
    },
    [settings]
  );

  const handleStart = () => {
    if (!running && secondsLeft > 0) {
      // request notification permission on first interaction
      try {
        if (Notification.permission === "default")
          Notification.requestPermission();
      } catch {}
      setRunning(true);
    }
  };
  const handlePause = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setSecondsLeft(totalSeconds);
  };
  const handleSkip = () => {
    setRunning(false);
    if (mode === "work") {
      if (session % settings.longBreakInterval === 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
      setSession((s) => s + 1);
    } else {
      switchMode("work");
    }
  };

  const applySettings = () => {
    const clamped = {
      work: Math.max(1, Math.min(120, tempSettings.work || 25)),
      shortBreak: Math.max(1, Math.min(60, tempSettings.shortBreak || 5)),
      longBreak: Math.max(1, Math.min(60, tempSettings.longBreak || 15)),
      longBreakInterval: Math.max(
        2,
        Math.min(10, tempSettings.longBreakInterval || 4)
      ),
    };
    setSettings(clamped);
    saveSettings(clamped);
    setTempSettings(clamped);
    setShowSettings(false);
    // reset timer with new durations
    const dur =
      mode === "work"
        ? clamped.work
        : mode === "shortBreak"
        ? clamped.shortBreak
        : clamped.longBreak;
    setTotalSeconds(dur * 60);
    setSecondsLeft(dur * 60);
    setRunning(false);
    if (showAlert) showAlert("Settings saved!", "success");
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const btnStyle = (bg) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    background: bg,
    color: "#fff",
    fontSize: 20,
    transition: "transform 0.15s, box-shadow 0.15s",
    boxShadow: `0 2px 10px ${bg}55`,
  });

  const modeBtnStyle = (m) => ({
    padding: "6px 16px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    background: mode === m ? modeColor : dark ? "#2d2d3d" : "#e2e8f0",
    color: mode === m ? "#fff" : sub,
    transition: "all 0.2s",
  });

  const inputStyle = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${dark ? "#3f3f5f" : "#cbd5e1"}`,
    background: dark ? "#1e1e2e" : "#f8fafc",
    color: txt,
    fontSize: 14,
    outline: "none",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: 440, margin: "0 auto", padding: "20px 12px" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h2
          style={{
            color: txt,
            fontSize: 26,
            fontWeight: 700,
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <FiClock style={{ color: primary }} />
          Pomodoro Timer
        </h2>
        <p style={{ color: sub, fontSize: 14, margin: "4px 0 0" }}>
          Stay focused, take breaks, get things done.
        </p>
      </div>

      {/* Mode selector */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {["work", "shortBreak", "longBreak"].map((m) => (
          <motion.button
            key={m}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={modeBtnStyle(m)}
            onClick={() => {
              if (!running) switchMode(m);
            }}
          >
            {m === "work" && <FiClock style={{ marginRight: 4 }} />}
            {m !== "work" && <FiCoffee style={{ marginRight: 4 }} />}
            {MODE_LABELS[m]}
          </motion.button>
        ))}
      </div>

      {/* Timer card */}
      <div
        className="card"
        style={{
          background: cardBg,
          borderRadius: 20,
          padding: "32px 20px",
          textAlign: "center",
          marginBottom: 20,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* SVG circular progress */}
        <div
          style={{
            position: "relative",
            width: SVG_SIZE,
            height: SVG_SIZE,
            margin: "0 auto 20px",
          }}
        >
          <svg
            width={SVG_SIZE}
            height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          >
            <defs>
              <linearGradient
                id={ringGradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={mode === "work" ? orange : green}
                />
                <stop offset="100%" stopColor={primary} />
              </linearGradient>
            </defs>
            {/* background ring */}
            <circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={dark ? "#2d2d3d" : "#e2e8f0"}
              strokeWidth={STROKE}
            />
            {/* progress ring */}
            <motion.circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={`url(#${ringGradientId})`}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${SVG_SIZE / 2} ${SVG_SIZE / 2})`}
              initial={false}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </svg>
          {/* time display */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <motion.div
              key={secondsLeft}
              initial={{ scale: 1.05, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color: txt,
                lineHeight: 1,
              }}
            >
              {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </motion.div>
            <div
              style={{
                fontSize: 13,
                color: modeColor,
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              {MODE_LABELS[mode]}
            </div>
          </div>
        </div>

        {/* Session counter */}
        <div
          style={{
            fontSize: 14,
            color: sub,
            marginBottom: 20,
            fontWeight: 500,
          }}
        >
          Session{" "}
          <span style={{ color: primary, fontWeight: 700 }}>
            {((session - 1) % settings.longBreakInterval) + 1}
          </span>
          /{settings.longBreakInterval}
          {session > 1 && (
            <span style={{ marginLeft: 8, fontSize: 12, color: sub }}>
              (Total: {session - 1} completed)
            </span>
          )}
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          {!running ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={btnStyle(primary)}
              onClick={handleStart}
              title="Start"
            >
              <FiPlay />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={btnStyle(orange)}
              onClick={handlePause}
              title="Pause"
            >
              <FiPause />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={btnStyle(dark ? "#475569" : "#94a3b8")}
            onClick={handleReset}
            title="Reset"
          >
            <FiRefreshCw />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={btnStyle(green)}
            onClick={handleSkip}
            title="Skip"
          >
            <FiSkipForward />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={btnStyle(dark ? "#3f3f5f" : "#cbd5e1")}
            onClick={() => {
              setTempSettings({ ...settings });
              setShowSettings((v) => !v);
            }}
            title="Settings"
          >
            <FiSettings style={{ color: dark ? "#f1f5f9" : "#334155" }} />
          </motion.button>
        </div>
      </div>

      {/* Stats card */}
      <div
        className="card"
        style={{
          background: cardBg,
          borderRadius: 16,
          padding: "18px 24px",
          marginBottom: 20,
          backdropFilter: "blur(12px)",
          display: "flex",
          justifyContent: "space-around",
          gap: 16,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, color: sub, marginBottom: 4 }}>
            Focused Today
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: orange }}>
            {stats.focusedMinutes}
            <span style={{ fontSize: 12, fontWeight: 400, color: sub }}>
              {" "}
              min
            </span>
          </div>
        </div>
        <div
          style={{
            width: 1,
            background: dark ? "#3f3f5f" : "#e2e8f0",
          }}
        />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, color: sub, marginBottom: 4 }}>
            Sessions Today
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: green }}>
            {stats.sessions}
          </div>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: cardBg,
              borderRadius: 16,
              padding: "24px",
              overflow: "hidden",
              backdropFilter: "blur(12px)",
            }}
          >
            <h3
              style={{
                color: txt,
                fontSize: 16,
                fontWeight: 700,
                margin: "0 0 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FiSettings style={{ color: primary }} />
              Timer Settings
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              {[
                { key: "work", label: "Work (min)" },
                { key: "shortBreak", label: "Short Break (min)" },
                { key: "longBreak", label: "Long Break (min)" },
                { key: "longBreakInterval", label: "Long Break After" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label
                    style={{
                      fontSize: 12,
                      color: sub,
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type="number"
                    min={key === "longBreakInterval" ? 2 : 1}
                    max={key === "longBreakInterval" ? 10 : 120}
                    value={tempSettings[key]}
                    onChange={(e) =>
                      setTempSettings((prev) => ({
                        ...prev,
                        [key]: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowSettings(false)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: `1px solid ${dark ? "#3f3f5f" : "#cbd5e1"}`,
                  background: "transparent",
                  color: sub,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={applySettings}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: `linear-gradient(135deg, ${primary}, ${modeColor})`,
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
