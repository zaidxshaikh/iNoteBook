import { motion } from "framer-motion";
import {
  FiShield, FiCloud, FiSmartphone, FiZap, FiLock, FiHeart,
  FiLayout, FiMaximize, FiDownload, FiTrash2, FiShare2, FiStar,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const features = [
  { icon: <FiCloud size={22} />,      title: "Cloud Synced",       desc: "Access your notes from anywhere, anytime. Always in sync.", color: "#3b82f6" },
  { icon: <FiShield size={22} />,     title: "Secure & Private",   desc: "Your data stays encrypted and private. Only you can see it.", color: "#10b981" },
  { icon: <FiZap size={22} />,        title: "Lightning Fast",     desc: "Instant loading, zero lag. Built for maximum productivity.", color: "#f59e0b" },
  { icon: <FiSmartphone size={22} />, title: "Fully Responsive",   desc: "Perfect on every device — desktop, tablet, or mobile.", color: "#8b5cf6" },
  { icon: <FiLayout size={22} />,     title: "Note Templates",     desc: "Meeting notes, todos, journals — start writing instantly.", color: "#06b6d4" },
  { icon: <FiMaximize size={22} />,   title: "Focus Mode",         desc: "Distraction-free writing with fullscreen zen mode.", color: "#ec4899" },
  { icon: <FiDownload size={22} />,   title: "Export & Import",    desc: "Export as JSON or text. Import notes from backup files.", color: "#f97316" },
  { icon: <FiTrash2 size={22} />,     title: "Trash & Restore",    desc: "Accidentally deleted? Restore notes from the trash bin.", color: "#ef4444" },
  { icon: <FiShare2 size={22} />,     title: "Share Notes",        desc: "Share as text, markdown, or send directly via email.", color: "#14b8a6" },
  { icon: <FiStar size={22} />,       title: "Pin & Organize",     desc: "Pin important notes, filter by tags, sort your way.", color: "#eab308" },
  { icon: <FiLock size={22} />,       title: "JWT Auth",           desc: "Industry-standard token authentication protects your account.", color: "#7c3aed" },
  { icon: <FiHeart size={22} />,      title: "Built with Love",    desc: "Modern tech stack — React, Node.js, Express, MongoDB.", color: "#ec4899" },
];

const techs = ["React 18", "Node.js", "Express", "MongoDB", "Tailwind CSS v4", "Framer Motion", "JWT", "Vite"];

export default function About() {
  const { dark } = useTheme();
  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";

  return (
    <div className="py-10">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 text-xs font-bold tracking-widest mb-4"
          style={{ borderRadius: 9999, background: dark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)",
            color: "#7c3aed", border: `1px solid ${dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)"}` }}>
          ABOUT
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: txt }}>
          Your Notes, <span className="text-gradient-warm">Secured</span>
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: sub }}>
          A modern cloud notebook packed with powerful features to keep your ideas organized, safe, and always within reach.
        </p>
      </motion.div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <motion.div key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-6 group"
            style={{ cursor: "default" }}
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
              style={{ background: `${f.color}15`, color: f.color }}>
              {f.icon}
            </div>
            <h3 className="text-base font-bold mb-1.5" style={{ color: txt }}>{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: sub }}>{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { num: "12+", label: "Features" },
          { num: "6", label: "Templates" },
          { num: "12", label: "Color Themes" },
          { num: "\u221E", label: "Notes" },
        ].map((s, i) => (
          <div key={i} className="card p-6 text-center">
            <p className="text-3xl font-bold text-gradient mb-1">{s.num}</p>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: sub }}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Tech */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-8 card p-8 sm:p-10 text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: txt }}>Tech Stack</h2>
        <p className="text-sm mb-6" style={{ color: sub }}>Powered by modern, reliable technologies</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {techs.map((t) => (
            <span key={t} className="px-4 py-2 text-sm font-medium"
              style={{ background: dark ? "rgba(51,65,85,0.35)" : "rgba(241,245,249,0.7)",
                color: sub, borderRadius: 10, border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}` }}>
              {t}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Keyboard shortcuts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="mt-8 card p-8 sm:p-10">
        <h2 className="text-xl font-bold mb-2 text-center" style={{ color: txt }}>Keyboard Shortcuts</h2>
        <p className="text-sm mb-6 text-center" style={{ color: sub }}>Power-user shortcuts to boost your productivity</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          {[
            { keys: "Ctrl + N", desc: "Quick focus note form" },
            { keys: "?", desc: "Toggle shortcuts panel" },
            { keys: "Ctrl + E", desc: "Toggle bulk select" },
            { keys: "Ctrl + Shift + E", desc: "Export notes" },
            { keys: "Escape", desc: "Close modals" },
          ].map((s) => (
            <div key={s.keys} className="flex items-center justify-between py-2 px-3"
              style={{ background: dark ? "rgba(51,65,85,0.15)" : "rgba(241,245,249,0.5)", borderRadius: 8 }}>
              <span className="text-xs" style={{ color: sub }}>{s.desc}</span>
              <kbd className="text-xs px-2 py-0.5 font-mono"
                style={{ background: dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.7)",
                  border: `1px solid ${dark ? "rgba(71,85,105,0.3)" : "rgba(203,213,225,0.5)"}`,
                  borderRadius: 5, color: dark ? "#94a3b8" : "#64748b" }}>
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
