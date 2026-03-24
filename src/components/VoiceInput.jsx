import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMic, FiMicOff, FiX } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceInput({ onResult, showAlert }) {
  const { dark } = useTheme();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported] = useState(!!SpeechRecognition);
  const recRef = useRef(null);

  useEffect(() => {
    return () => { if (recRef.current) recRef.current.abort(); };
  }, []);

  const start = () => {
    if (!supported) { showAlert("Voice input not supported in this browser", "danger"); return; }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };
    rec.onerror = (e) => {
      if (e.error !== "aborted") showAlert("Voice error: " + e.error, "danger");
      setListening(false);
    };
    rec.onend = () => setListening(false);

    recRef.current = rec;
    rec.start();
    setListening(true);
    setTranscript("");
  };

  const stop = () => {
    if (recRef.current) recRef.current.stop();
    setListening(false);
    if (transcript && onResult) onResult(transcript);
  };

  const cancel = () => {
    if (recRef.current) recRef.current.abort();
    setListening(false);
    setTranscript("");
  };

  const muted = dark ? "#64748b" : "#94a3b8";
  const sub = dark ? "#94a3b8" : "#64748b";

  if (!supported) return null;

  return (
    <div className="relative inline-flex">
      <button type="button" onClick={listening ? stop : start} title="Voice input"
        className="p-2 cursor-pointer"
        style={{
          border: "none", borderRadius: 8,
          background: listening ? "rgba(239,68,68,0.1)" : "transparent",
          color: listening ? "#ef4444" : muted,
          transition: "all 0.2s",
        }}>
        {listening ? <FiMicOff size={16} /> : <FiMic size={16} />}
      </button>

      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute left-0 top-full mt-2 z-30 card p-4"
            style={{ minWidth: 280, maxWidth: 360 }}>
            {/* Pulse indicator */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
                <div className="absolute inset-0 w-3 h-3 rounded-full" style={{
                  background: "#ef4444", animation: "pulse 1.5s infinite", opacity: 0.4,
                }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: "#ef4444" }}>Listening...</span>
              <button onClick={cancel} className="ml-auto p-1 cursor-pointer"
                style={{ border: "none", background: "transparent", color: muted }}>
                <FiX size={14} />
              </button>
            </div>

            {/* Transcript */}
            <div className="p-3 rounded-lg min-h-[60px] text-sm"
              style={{
                background: dark ? "rgba(30,41,59,0.5)" : "rgba(241,245,249,0.8)",
                border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                color: sub,
              }}>
              {transcript || "Start speaking..."}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button onClick={stop}
                className="flex-1 px-3 py-2 text-xs font-semibold cursor-pointer"
                style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}>
                Done & Insert
              </button>
              <button onClick={cancel}
                className="px-3 py-2 text-xs font-semibold cursor-pointer"
                style={{ background: dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.7)",
                  color: sub, border: "none", borderRadius: 8 }}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
