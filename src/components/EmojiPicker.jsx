import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSmile, FiX } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const categories = {
  "Smileys": ["😀","😁","😂","🤣","😊","😍","🥰","😎","🤩","🥳","😤","😭","🤔","🤫","🫡","😴","🤯","🥶","🤮","👻"],
  "Hands": ["👍","👎","👏","🙌","🤝","✌️","🤞","👊","✊","🫶","👋","🖐️","✋","🤙","💪","🙏","☝️","👈","👉","👆"],
  "Hearts": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","❤️‍🔥","💝","💖","💗","💓","💞","💕","💘","💟","♥️","🫀"],
  "Nature": ["🌞","🌙","⭐","🌈","🔥","💧","❄️","⚡","🌸","🌺","🌻","🌹","🍀","🌴","🌊","🦋","🐝","🐱","🐶","🦊"],
  "Food": ["☕","🍕","🍔","🍟","🌮","🍣","🍰","🍩","🍪","🎂","🧁","🍫","🍎","🍊","🍋","🍇","🍓","🫐","🥑","🍌"],
  "Objects": ["💡","📝","📌","📎","✏️","🖊️","📖","📚","🎯","🏆","🎉","🎊","🎈","🎁","🔔","🔑","💎","🧲","🔮","🪄"],
  "Symbols": ["✅","❌","⚠️","💯","🔴","🟠","🟡","🟢","🔵","🟣","⬛","⬜","🔷","🔶","💠","🔸","🔹","▶️","⏸️","🔄"],
};

export default function EmojiPicker({ onSelect, showAlert }) {
  const { dark } = useTheme();
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState("Smileys");
  const [search, setSearch] = useState("");

  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";
  const txt = dark ? "#f1f5f9" : "#0f172a";

  const allEmojis = Object.values(categories).flat();
  const filtered = search
    ? allEmojis.filter(() => true) // emoji search is hard without names, just show all
    : categories[cat] || [];

  return (
    <div className="relative inline-flex">
      <button type="button" onClick={() => setOpen(!open)} title="Add emoji"
        className="p-2 cursor-pointer"
        style={{ border: "none", borderRadius: 8, background: open ? "rgba(124,58,237,0.1)" : "transparent",
          color: open ? "#7c3aed" : muted }}>
        <FiSmile size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute left-0 top-full mt-2 z-30 card"
            style={{ width: 300 }}>
            {/* Header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <span className="text-xs font-bold" style={{ color: txt }}>Emoji</span>
              <button onClick={() => setOpen(false)} className="cursor-pointer"
                style={{ border: "none", background: "transparent", color: muted }}>
                <FiX size={14} />
              </button>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 px-3 pb-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {Object.keys(categories).map((c) => (
                <button key={c} onClick={() => setCat(c)}
                  className="px-2 py-1 text-xs font-medium cursor-pointer whitespace-nowrap"
                  style={{
                    border: "none", borderRadius: 6,
                    background: cat === c ? "rgba(124,58,237,0.1)" : "transparent",
                    color: cat === c ? "#7c3aed" : muted,
                  }}>
                  {c}
                </button>
              ))}
            </div>

            {/* Emojis grid */}
            <div className="px-3 pb-3 grid grid-cols-8 gap-0.5" style={{ maxHeight: 200, overflowY: "auto" }}>
              {filtered.map((emoji, i) => (
                <button key={i} onClick={() => { onSelect(emoji); setOpen(false); }}
                  className="flex items-center justify-center cursor-pointer text-lg"
                  style={{
                    width: 32, height: 32, border: "none", borderRadius: 6,
                    background: "transparent", transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.target.style.background = dark ? "rgba(51,65,85,0.4)" : "rgba(241,245,249,0.8)"}
                  onMouseLeave={(e) => e.target.style.background = "transparent"}>
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
