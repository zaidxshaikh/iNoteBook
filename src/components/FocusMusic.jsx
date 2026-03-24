import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiVolume2, FiVolumeX, FiClock, FiMinimize2, FiMaximize2 } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const SOUNDS = [
  { id: "rain", name: "Rain", emoji: "\u{1F327}\uFE0F" },
  { id: "ocean", name: "Ocean Waves", emoji: "\u{1F30A}" },
  { id: "whitenoise", name: "White Noise", emoji: "\u{1F4AC}" },
  { id: "brownnoise", name: "Brown Noise", emoji: "\u{1F7EB}" },
  { id: "wind", name: "Wind", emoji: "\u{1F32C}\uFE0F" },
  { id: "fireplace", name: "Fireplace", emoji: "\u{1F525}" },
  { id: "birds", name: "Birds", emoji: "\u{1F426}" },
];

const TIMER_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "45m", value: 45 },
  { label: "60m", value: 60 },
];

// --- Audio engine helpers ---

function createWhiteNoiseBuffer(ctx, duration = 2) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function startRain(ctx, gainNode) {
  const noiseBuffer = createWhiteNoiseBuffer(ctx, 2);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 800;
  bandpass.Q.value = 0.5;

  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 400;

  // Amplitude modulation for rain patter
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 3.5;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.3;
  const modGain = ctx.createGain();
  modGain.gain.value = 0.7;

  lfo.connect(lfoGain);
  lfoGain.connect(modGain.gain);

  source.connect(bandpass);
  bandpass.connect(highpass);
  highpass.connect(modGain);
  modGain.connect(gainNode);

  source.start();
  lfo.start();
  return () => { source.stop(); lfo.stop(); };
}

function startOcean(ctx, gainNode) {
  const noiseBuffer = createWhiteNoiseBuffer(ctx, 4);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 500;

  // Slow LFO for wave swell
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.12;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.45;
  const modGain = ctx.createGain();
  modGain.gain.value = 0.55;

  lfo.connect(lfoGain);
  lfoGain.connect(modGain.gain);

  // Secondary layer for depth
  const lfo2 = ctx.createOscillator();
  lfo2.type = "sine";
  lfo2.frequency.value = 0.07;
  const lfo2Gain = ctx.createGain();
  lfo2Gain.gain.value = 200;
  lfo2.connect(lfo2Gain);
  lfo2Gain.connect(lowpass.frequency);

  source.connect(lowpass);
  lowpass.connect(modGain);
  modGain.connect(gainNode);

  source.start();
  lfo.start();
  lfo2.start();
  return () => { source.stop(); lfo.stop(); lfo2.stop(); };
}

function startWhiteNoise(ctx, gainNode) {
  const noiseBuffer = createWhiteNoiseBuffer(ctx, 2);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;
  source.connect(gainNode);
  source.start();
  return () => { source.stop(); };
}

function startBrownNoise(ctx, gainNode) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 300;

  source.connect(lowpass);
  lowpass.connect(gainNode);
  source.start();
  return () => { source.stop(); };
}

function startWind(ctx, gainNode) {
  const noiseBuffer = createWhiteNoiseBuffer(ctx, 4);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = 600;
  bandpass.Q.value = 1.5;

  // Slow modulation for gusts
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.15;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.4;
  const modGain = ctx.createGain();
  modGain.gain.value = 0.4;

  lfo.connect(lfoGain);
  lfoGain.connect(modGain.gain);

  // Frequency modulation for variation
  const lfo2 = ctx.createOscillator();
  lfo2.type = "sine";
  lfo2.frequency.value = 0.08;
  const lfo2Gain = ctx.createGain();
  lfo2Gain.gain.value = 300;
  lfo2.connect(lfo2Gain);
  lfo2Gain.connect(bandpass.frequency);

  source.connect(bandpass);
  bandpass.connect(modGain);
  modGain.connect(gainNode);

  source.start();
  lfo.start();
  lfo2.start();
  return () => { source.stop(); lfo.stop(); lfo2.stop(); };
}

function startFireplace(ctx, gainNode) {
  let stopped = false;
  const nodes = [];

  function crackle() {
    if (stopped) return;
    const dur = 0.03 + Math.random() * 0.06;
    const bufLen = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 800 + Math.random() * 2000;
    bp.Q.value = 2;

    const env = ctx.createGain();
    env.gain.value = 0.4 + Math.random() * 0.6;

    src.connect(bp);
    bp.connect(env);
    env.connect(gainNode);
    src.start();
    nodes.push(src);

    const next = 30 + Math.random() * 120;
    setTimeout(crackle, next);
  }

  // Base rumble layer
  const noiseBuffer = createWhiteNoiseBuffer(ctx, 2);
  const baseSrc = ctx.createBufferSource();
  baseSrc.buffer = noiseBuffer;
  baseSrc.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 200;
  const baseGain = ctx.createGain();
  baseGain.gain.value = 0.35;
  baseSrc.connect(lp);
  lp.connect(baseGain);
  baseGain.connect(gainNode);
  baseSrc.start();

  crackle();

  return () => {
    stopped = true;
    try { baseSrc.stop(); } catch (e) { /* ignore */ }
    nodes.forEach((n) => { try { n.stop(); } catch (e) { /* ignore */ } });
  };
}

function startBirds(ctx, gainNode) {
  let stopped = false;
  const nodes = [];

  function chirp() {
    if (stopped) return;
    const baseFreq = 2000 + Math.random() * 3000;
    const dur = 0.06 + Math.random() * 0.12;
    const noteCount = 1 + Math.floor(Math.random() * 4);

    for (let n = 0; n < noteCount; n++) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      const freq = baseFreq + (Math.random() - 0.5) * 800;
      osc.frequency.value = freq;

      // Frequency sweep
      osc.frequency.setValueAtTime(freq, ctx.currentTime + n * dur);
      osc.frequency.linearRampToValueAtTime(
        freq + (Math.random() - 0.5) * 1200,
        ctx.currentTime + n * dur + dur * 0.8
      );

      const env = ctx.createGain();
      env.gain.setValueAtTime(0, ctx.currentTime + n * dur);
      env.gain.linearRampToValueAtTime(0.3, ctx.currentTime + n * dur + dur * 0.1);
      env.gain.linearRampToValueAtTime(0.15, ctx.currentTime + n * dur + dur * 0.5);
      env.gain.linearRampToValueAtTime(0, ctx.currentTime + n * dur + dur);

      osc.connect(env);
      env.connect(gainNode);
      const startT = ctx.currentTime + n * dur;
      osc.start(startT);
      osc.stop(startT + dur + 0.01);
      nodes.push(osc);
    }

    const next = 800 + Math.random() * 3000;
    setTimeout(chirp, next);
  }

  chirp();
  return () => {
    stopped = true;
    nodes.forEach((n) => { try { n.stop(); } catch (e) { /* ignore */ } });
  };
}

const SOUND_STARTERS = {
  rain: startRain,
  ocean: startOcean,
  whitenoise: startWhiteNoise,
  brownnoise: startBrownNoise,
  wind: startWind,
  fireplace: startFireplace,
  birds: startBirds,
};

// --- Component ---

export default function FocusMusic({ showAlert }) {
  const { dark } = useTheme();
  const [activeSounds, setActiveSounds] = useState({});
  const [volumes, setVolumes] = useState(() => {
    const v = {};
    SOUNDS.forEach((s) => (v[s.id] = 50));
    return v;
  });
  const [masterVolume, setMasterVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [compact, setCompact] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const soundGainsRef = useRef({});
  const stopFnsRef = useRef({});
  const timerRef = useRef(null);

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const primary = "#7c3aed";
  const bg = dark ? "#1e293b" : "#ffffff";
  const cardBg = dark ? "#0f172a" : "#f8fafc";
  const surfaceBg = dark ? "#1e293b" : "#f1f5f9";

  // Initialize AudioContext lazily
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AC();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = (masterVolume / 100) * (muted ? 0 : 1);
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Update master volume
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        muted ? 0 : masterVolume / 100,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  }, [masterVolume, muted]);

  // Update individual volumes
  useEffect(() => {
    Object.entries(volumes).forEach(([id, vol]) => {
      if (soundGainsRef.current[id]) {
        const ctx = audioCtxRef.current;
        if (ctx) {
          soundGainsRef.current[id].gain.setTargetAtTime(vol / 100, ctx.currentTime, 0.05);
        }
      }
    });
  }, [volumes]);

  const toggleSound = useCallback((id) => {
    setActiveSounds((prev) => {
      const next = { ...prev };
      if (next[id]) {
        // Stop
        if (stopFnsRef.current[id]) {
          stopFnsRef.current[id]();
          delete stopFnsRef.current[id];
        }
        if (soundGainsRef.current[id]) {
          soundGainsRef.current[id].disconnect();
          delete soundGainsRef.current[id];
        }
        delete next[id];
      } else {
        // Start
        const ctx = getAudioCtx();
        const gain = ctx.createGain();
        gain.gain.value = volumes[id] / 100;
        gain.connect(masterGainRef.current);
        soundGainsRef.current[id] = gain;

        const stopFn = SOUND_STARTERS[id](ctx, gain);
        stopFnsRef.current[id] = stopFn;
        next[id] = true;
      }
      return next;
    });
  }, [getAudioCtx, volumes]);

  const stopAll = useCallback(() => {
    Object.keys(stopFnsRef.current).forEach((id) => {
      try { stopFnsRef.current[id](); } catch (e) { /* ignore */ }
    });
    stopFnsRef.current = {};
    Object.keys(soundGainsRef.current).forEach((id) => {
      try { soundGainsRef.current[id].disconnect(); } catch (e) { /* ignore */ }
    });
    soundGainsRef.current = {};
    setActiveSounds({});
  }, []);

  // Timer logic
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timer === 0) {
      setTimeLeft(null);
      return;
    }
    const activeCount = Object.keys(activeSounds).length;
    if (activeCount === 0) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(timer * 60);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopAll();
          if (showAlert) showAlert("Focus timer ended. Sounds stopped.", "info");
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timer, Object.keys(activeSounds).length > 0]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  const activeCount = Object.keys(activeSounds).length;

  const formatTime = (s) => {
    if (s === null) return "";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // --- Compact floating player ---
  if (compact) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background: dark ? "#0f172a" : "#ffffff",
          border: `2px solid ${primary}`,
          borderRadius: 16,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: `0 8px 32px ${primary}33`,
          color: txt,
          minWidth: 240,
        }}
      >
        <span style={{ fontSize: 20 }}>
          {activeCount > 0
            ? SOUNDS.filter((s) => activeSounds[s.id]).map((s) => s.emoji).join("")
            : "\u{1F3B5}"}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {activeCount > 0 ? `${activeCount} sound${activeCount > 1 ? "s" : ""}` : "No sounds"}
          </div>
          {timeLeft !== null && (
            <div style={{ fontSize: 11, color: sub }}>{formatTime(timeLeft)} left</div>
          )}
        </div>
        <button
          onClick={() => setMuted((m) => !m)}
          style={{
            background: "none",
            border: "none",
            color: muted ? "#ef4444" : txt,
            cursor: "pointer",
            fontSize: 18,
            padding: 4,
          }}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <FiVolumeX /> : <FiVolume2 />}
        </button>
        <button
          onClick={() => setCompact(false)}
          style={{
            background: "none",
            border: "none",
            color: txt,
            cursor: "pointer",
            fontSize: 18,
            padding: 4,
          }}
          title="Expand"
        >
          <FiMaximize2 />
        </button>
      </motion.div>
    );
  }

  // --- Full UI ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ color: txt, margin: 0, fontSize: 26, fontWeight: 700 }}>
            <span style={{ marginRight: 10 }}>{"\u{1F3B6}"}</span>Focus Music
          </h2>
          <p style={{ color: sub, margin: "4px 0 0", fontSize: 14 }}>
            Mix ambient sounds to help you focus
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Timer */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowTimerMenu((v) => !v)}
              style={{
                background: timer > 0 ? primary : (dark ? "#334155" : "#e2e8f0"),
                color: timer > 0 ? "#fff" : txt,
                border: "none",
                borderRadius: 10,
                padding: "8px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <FiClock />
              {timer > 0 ? (timeLeft !== null ? formatTime(timeLeft) : `${timer}m`) : "Timer"}
            </button>
            <AnimatePresence>
              {showTimerMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute",
                    top: "110%",
                    right: 0,
                    background: dark ? "#1e293b" : "#fff",
                    border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
                    borderRadius: 12,
                    padding: 6,
                    zIndex: 50,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    minWidth: 100,
                  }}
                >
                  {TIMER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setTimer(opt.value);
                        setShowTimerMenu(false);
                        if (opt.value === 0) setTimeLeft(null);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        background: timer === opt.value ? `${primary}22` : "transparent",
                        color: timer === opt.value ? primary : txt,
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 14px",
                        cursor: "pointer",
                        fontSize: 14,
                        textAlign: "left",
                        fontWeight: timer === opt.value ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Minimize */}
          <button
            onClick={() => setCompact(true)}
            style={{
              background: dark ? "#334155" : "#e2e8f0",
              color: txt,
              border: "none",
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
            }}
            title="Minimize to floating player"
          >
            <FiMinimize2 />
          </button>
        </div>
      </div>

      {/* Master volume */}
      <div
        className="card"
        style={{
          background: cardBg,
          borderRadius: 14,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 14,
          border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
        }}
      >
        <button
          onClick={() => setMuted((m) => !m)}
          style={{
            background: "none",
            border: "none",
            color: muted ? "#ef4444" : primary,
            cursor: "pointer",
            fontSize: 22,
            padding: 4,
            display: "flex",
          }}
        >
          {muted ? <FiVolumeX /> : <FiVolume2 />}
        </button>
        <span style={{ color: txt, fontWeight: 600, fontSize: 14, minWidth: 100 }}>
          Master Volume
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : masterVolume}
          onChange={(e) => {
            setMasterVolume(Number(e.target.value));
            if (muted) setMuted(false);
          }}
          style={{
            flex: 1,
            accentColor: primary,
            height: 6,
            cursor: "pointer",
          }}
        />
        <span style={{ color: sub, fontSize: 13, minWidth: 36, textAlign: "right" }}>
          {muted ? 0 : masterVolume}%
        </span>
        {activeCount > 0 && (
          <button
            onClick={stopAll}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              marginLeft: 8,
            }}
          >
            Stop All
          </button>
        )}
      </div>

      {/* Sound grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 14,
        }}
      >
        {SOUNDS.map((sound) => {
          const active = !!activeSounds[sound.id];
          return (
            <motion.div
              key={sound.id}
              className="card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: active
                  ? `linear-gradient(135deg, ${primary}18, ${primary}08)`
                  : cardBg,
                borderRadius: 16,
                padding: "20px 18px 16px",
                border: active
                  ? `2px solid ${primary}`
                  : `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "border 0.2s, background 0.2s",
                boxShadow: active
                  ? `0 0 20px ${primary}33, 0 4px 16px ${primary}22`
                  : "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {/* Glow effect */}
              {active && (
                <motion.div
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: primary,
                    filter: "blur(30px)",
                    opacity: 0.3,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Sound toggle area */}
              <div
                onClick={() => toggleSound(sound.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}
              >
                <motion.div
                  animate={active ? { scale: [1, 1.15, 1] } : {}}
                  transition={active ? { duration: 1.5, repeat: Infinity } : {}}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: active ? `${primary}22` : (dark ? "#1e293b" : "#e2e8f0"),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {sound.emoji}
                </motion.div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: txt, fontWeight: 600, fontSize: 15 }}>{sound.name}</div>
                  <div style={{ color: active ? primary : sub, fontSize: 12, marginTop: 2 }}>
                    {active ? "Playing" : "Tap to play"}
                  </div>
                </div>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: active ? "#22c55e" : (dark ? "#334155" : "#cbd5e1"),
                    boxShadow: active ? "0 0 8px #22c55e88" : "none",
                    transition: "all 0.3s",
                  }}
                />
              </div>

              {/* Volume slider */}
              <div
                style={{ display: "flex", alignItems: "center", gap: 8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <FiVolume2 style={{ color: sub, fontSize: 14, flexShrink: 0 }} />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volumes[sound.id]}
                  onChange={(e) => {
                    setVolumes((v) => ({ ...v, [sound.id]: Number(e.target.value) }));
                  }}
                  style={{
                    flex: 1,
                    accentColor: active ? primary : sub,
                    height: 4,
                    cursor: "pointer",
                  }}
                />
                <span style={{ color: sub, fontSize: 11, minWidth: 28, textAlign: "right" }}>
                  {volumes[sound.id]}%
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Active sounds summary */}
      <AnimatePresence>
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="card"
            style={{
              marginTop: 20,
              background: cardBg,
              borderRadius: 14,
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: 20 }}
              >
                {"\u{1F3A7}"}
              </motion.div>
              <div>
                <span style={{ color: txt, fontWeight: 600, fontSize: 14 }}>
                  Now playing: {" "}
                </span>
                <span style={{ color: sub, fontSize: 13 }}>
                  {SOUNDS.filter((s) => activeSounds[s.id])
                    .map((s) => `${s.emoji} ${s.name}`)
                    .join("  \u00B7  ")}
                </span>
              </div>
            </div>
            {timeLeft !== null && (
              <div
                style={{
                  color: primary,
                  fontWeight: 600,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FiClock />
                {formatTime(timeLeft)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
