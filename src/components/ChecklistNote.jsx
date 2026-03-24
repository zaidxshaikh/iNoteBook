import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function ChecklistNote({ items: initial, onChange, onClose }) {
  const { dark } = useTheme();
  const [items, setItems] = useState(initial || []);
  const [newItem, setNewItem] = useState("");

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  const update = (newItems) => {
    setItems(newItems);
    if (onChange) onChange(newItems);
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    update([...items, { id: Date.now(), text: newItem.trim(), done: false }]);
    setNewItem("");
  };

  const toggleItem = (id) => {
    update(items.map((i) => i.id === id ? { ...i, done: !i.done } : i));
  };

  const removeItem = (id) => {
    update(items.filter((i) => i.id !== id));
  };

  const doneCount = items.filter((i) => i.done).length;
  const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div>
      {/* Progress */}
      {items.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: sub }}>
              {doneCount}/{items.length} completed
            </span>
            <span className="text-xs font-bold" style={{ color: progress === 100 ? "#10b981" : "#7c3aed" }}>
              {progress}%
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Items */}
      <div className="space-y-1.5 mb-3">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div key={item.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2.5 py-1.5 group">
              <button onClick={() => toggleItem(item.id)}
                className="w-5 h-5 rounded-md flex items-center justify-center cursor-pointer shrink-0"
                style={{
                  border: `2px solid ${item.done ? "#10b981" : dark ? "rgba(51,65,85,0.5)" : "rgba(203,213,225,0.7)"}`,
                  background: item.done ? "#10b981" : "transparent",
                  transition: "all 0.2s",
                }}>
                {item.done && <FiCheck size={12} className="text-white" />}
              </button>
              <span className="text-sm flex-1" style={{
                color: item.done ? muted : txt,
                textDecoration: item.done ? "line-through" : "none",
                transition: "all 0.2s",
              }}>
                {item.text}
              </span>
              <button onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1 cursor-pointer"
                style={{ border: "none", background: "transparent", color: muted, transition: "opacity 0.2s" }}>
                <FiTrash2 size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add item */}
      <div className="flex gap-2">
        <input value={newItem} onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add item..."
          className="input-modern text-sm flex-1"
          style={{ padding: "8px 12px" }}
          onKeyDown={(e) => e.key === "Enter" && addItem()} />
        <button onClick={addItem}
          className="px-3 cursor-pointer flex items-center justify-center"
          style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8 }}>
          <FiPlus size={16} />
        </button>
      </div>
    </div>
  );
}

// Parse checklist from text
export function parseChecklist(text) {
  const lines = text.split("\n");
  return lines
    .filter((l) => /^\s*[-*]\s*\[[ x]\]/.test(l))
    .map((l, i) => ({
      id: i,
      text: l.replace(/^\s*[-*]\s*\[[ x]\]\s*/, "").trim(),
      done: /\[x\]/i.test(l),
    }));
}

// Convert checklist items back to text
export function checklistToText(items) {
  return items.map((i) => `- [${i.done ? "x" : " "}] ${i.text}`).join("\n");
}
