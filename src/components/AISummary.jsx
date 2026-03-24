import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap, FiX, FiCopy, FiCheck } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

// Simple extractive summarizer - no API needed
function summarize(text, sentences = 3) {
  const sents = text.replace(/([.!?])\s+/g, "$1|").split("|").filter((s) => s.trim().length > 10);
  if (sents.length <= sentences) return text;
  // Score sentences by word count and position
  const scored = sents.map((s, i) => ({
    text: s.trim(),
    score: s.trim().split(/\s+/).length * (i === 0 ? 1.5 : 1) * (i === sents.length - 1 ? 1.2 : 1),
    idx: i,
  }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, sentences).sort((a, b) => a.idx - b.idx);
  return top.map((s) => s.text).join(". ") + ".";
}

function extractKeywords(text) {
  const stops = new Set(["the","a","an","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","shall","can","need","dare","ought","used","to","of","in","for","on","with","at","by","from","as","into","through","during","before","after","above","below","between","out","off","over","under","again","further","then","once","here","there","when","where","why","how","all","both","each","few","more","most","other","some","such","no","nor","not","only","own","same","so","than","too","very","just","because","but","and","or","if","this","that","these","those","i","me","my","we","our","you","your","he","him","his","she","her","it","its","they","them","their","what","which","who","whom"]);
  const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter((w) => w.length > 3 && !stops.has(w));
  const freq = {};
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);
}

function suggestTags(text) {
  const tagMap = {
    work: ["meeting", "project", "deadline", "client", "team", "report", "task", "office", "manager", "email"],
    study: ["study", "learn", "exam", "class", "course", "lecture", "homework", "research", "book", "chapter"],
    personal: ["family", "friend", "hobby", "vacation", "travel", "home", "health", "exercise", "cook", "movie"],
    ideas: ["idea", "think", "maybe", "could", "concept", "design", "create", "innovate", "brainstorm", "plan"],
    important: ["important", "urgent", "critical", "asap", "priority", "must", "essential", "key", "vital", "crucial"],
    todo: ["todo", "buy", "call", "fix", "clean", "send", "schedule", "complete", "finish", "prepare"],
  };
  const lower = text.toLowerCase();
  const scores = {};
  Object.entries(tagMap).forEach(([tag, keywords]) => {
    scores[tag] = keywords.filter((k) => lower.includes(k)).length;
  });
  return Object.entries(scores).filter(([, s]) => s > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
}

export default function AISummary({ note, onClose }) {
  const { dark } = useTheme();
  const [copied, setCopied] = useState(false);

  const summary = summarize(note.description);
  const keywords = extractKeywords(note.description);
  const suggestedTags = suggestTags(note.description);
  const wordCount = note.description.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const sentenceCount = note.description.split(/[.!?]+/).filter((s) => s.trim()).length;

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  const doCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg card p-6 sm:p-8"
        style={{ maxHeight: "85vh", overflowY: "auto" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
              <FiZap size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: txt }}>AI Summary</h3>
              <p className="text-xs" style={{ color: muted }}>{note.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 cursor-pointer"
            style={{ border: "none", background: "transparent", color: muted }}>
            <FiX size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Words", value: wordCount },
            { label: "Sentences", value: sentenceCount },
            { label: "Read Time", value: `${readTime}min` },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-xl"
              style={{ background: dark ? "rgba(51,65,85,0.2)" : "rgba(241,245,249,0.5)" }}>
              <p className="text-lg font-bold" style={{ color: txt }}>{s.value}</p>
              <p className="text-xs" style={{ color: muted }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: sub }}>Summary</h4>
            <button onClick={doCopy} className="flex items-center gap-1 text-xs cursor-pointer"
              style={{ border: "none", background: "transparent", color: "#7c3aed" }}>
              {copied ? <><FiCheck size={12} /> Copied</> : <><FiCopy size={12} /> Copy</>}
            </button>
          </div>
          <p className="text-sm leading-relaxed p-4 rounded-xl"
            style={{ background: dark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.03)",
              border: `1px solid ${dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.06)"}`,
              color: sub }}>
            {summary}
          </p>
        </div>

        {/* Keywords */}
        {keywords.length > 0 && (
          <div className="mb-5">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: sub }}>Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {keywords.map((k) => (
                <span key={k} className="px-3 py-1 text-xs font-medium rounded-lg"
                  style={{ background: dark ? "rgba(6,182,212,0.08)" : "rgba(6,182,212,0.05)",
                    color: "#06b6d4", border: `1px solid ${dark ? "rgba(6,182,212,0.15)" : "rgba(6,182,212,0.1)"}` }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Tags */}
        {suggestedTags.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: sub }}>Suggested Tags</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((t) => (
                <span key={t} className="px-3 py-1 text-xs font-semibold rounded-lg capitalize"
                  style={{ background: "rgba(124,58,237,0.08)", color: "#7c3aed",
                    border: "1px solid rgba(124,58,237,0.15)" }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
