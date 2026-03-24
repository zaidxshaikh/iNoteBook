import { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEdit3 } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

// Simple markdown renderer - no external library
function renderMd(text) {
  let html = text
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.05);padding:12px;border-radius:8px;overflow-x:auto;font-size:13px;font-family:monospace;margin:8px 0"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:rgba(124,58,237,0.08);padding:2px 6px;border-radius:4px;font-size:13px;font-family:monospace">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;font-weight:700;margin:16px 0 8px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;font-weight:700;margin:16px 0 8px">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:22px;font-weight:700;margin:16px 0 8px">$1</h1>')
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#7c3aed;text-decoration:underline" target="_blank">$1</a>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #7c3aed;padding-left:12px;margin:8px 0;color:#64748b;font-style:italic">$1</blockquote>')
    // Checkboxes
    .replace(/^- \[x\] (.+)$/gm, '<div style="display:flex;align-items:center;gap:8px;margin:4px 0"><span style="width:16px;height:16px;border-radius:4px;background:#10b981;display:flex;align-items:center;justify-content:center;color:white;font-size:10px">✓</span><span style="text-decoration:line-through;color:#94a3b8">$1</span></div>')
    .replace(/^- \[ \] (.+)$/gm, '<div style="display:flex;align-items:center;gap:8px;margin:4px 0"><span style="width:16px;height:16px;border-radius:4px;border:2px solid #cbd5e1"></span><span>$1</span></div>')
    // Unordered list
    .replace(/^[-*] (.+)$/gm, '<li style="margin:4px 0;margin-left:16px">$1</li>')
    // Ordered list
    .replace(/^\d+\. (.+)$/gm, '<li style="margin:4px 0;margin-left:16px;list-style:decimal">$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(124,58,237,0.15);margin:16px 0">')
    // Line breaks
    .replace(/\n/g, '<br>');
  return html;
}

export default function MarkdownPreview({ text }) {
  const { dark } = useTheme();
  const [preview, setPreview] = useState(false);

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";

  return (
    <div>
      <button onClick={() => setPreview(!preview)}
        className="flex items-center gap-1.5 text-xs font-medium cursor-pointer mb-2"
        style={{ border: "none", background: "transparent", color: "#7c3aed", padding: 0 }}>
        {preview ? <><FiEdit3 size={12} /> Edit</> : <><FiEye size={12} /> Preview</>}
      </button>
      {preview && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="p-4 rounded-xl text-sm leading-relaxed"
          style={{
            background: dark ? "rgba(30,41,59,0.4)" : "rgba(241,245,249,0.6)",
            border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
            color: txt,
            minHeight: 80,
          }}
          dangerouslySetInnerHTML={{ __html: renderMd(text) }}
        />
      )}
    </div>
  );
}

// Export for use in expanded note view
export { renderMd };
