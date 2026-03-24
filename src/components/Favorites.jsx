import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiClock, FiSearch, FiX } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

const FAVS_KEY = "inotebook-favorites";
export function getFavorites() { const s = localStorage.getItem(FAVS_KEY); return s ? JSON.parse(s) : []; }
export function isFavorite(id) { return getFavorites().includes(id); }
export function toggleFavorite(id) {
  const favs = getFavorites();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  localStorage.setItem(FAVS_KEY, JSON.stringify(next));
  return next.includes(id);
}

export default function Favorites({ showAlert }) {
  const { notes } = useContext(noteContext);
  const { dark } = useTheme();
  const [favIds, setFavIds] = useState(getFavorites());
  const [search, setSearch] = useState("");

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  const favNotes = notes.filter((n) => favIds.includes(n._id));
  const filtered = favNotes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.description.toLowerCase().includes(search.toLowerCase())
  );

  const removeFav = (id) => {
    toggleFavorite(id);
    setFavIds(getFavorites());
    showAlert("Removed from favorites", "success");
  };

  const fmt = (d) => {
    const ms = Date.now() - new Date(d);
    const m = Math.floor(ms / 60000), h = Math.floor(ms / 3600000), dy = Math.floor(ms / 86400000);
    if (m < 60) return `${m}m ago`; if (h < 24) return `${h}h ago`; if (dy < 7) return `${dy}d ago`;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: txt }}>
              <FiHeart className="inline mr-3" style={{ verticalAlign: "-4px", fill: "#ec4899", color: "#ec4899" }} size={28} />
              Favorites
            </h1>
            <p className="text-sm" style={{ color: muted }}>{favNotes.length} bookmarked notes</p>
          </div>
          {favNotes.length > 0 && (
            <div className="relative w-full sm:w-56">
              <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: muted }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search favorites..."
                className="input-modern text-sm" style={{ paddingLeft: 38, padding: "10px 38px" }} />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ border: "none", background: "transparent", color: muted }}><FiX size={15} /></button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {favNotes.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-24">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: dark ? "rgba(236,72,153,0.08)" : "rgba(236,72,153,0.05)",
              border: `1px solid ${dark ? "rgba(236,72,153,0.12)" : "rgba(236,72,153,0.08)"}` }}>
            <FiHeart size={36} style={{ color: "#ec4899" }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: txt }}>No Favorites Yet</h3>
          <p className="text-sm text-center max-w-xs" style={{ color: muted }}>
            Click the heart icon on any note to bookmark it here
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((n, i) => (
              <motion.div key={n._id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}
                className="note-card">
                {n.color && (
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
                    borderRadius: "4px 0 0 4px", background: `linear-gradient(to bottom, ${n.color}, ${n.color}88)`, zIndex: 2 }} />
                )}
                <div className="p-5 pl-7">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: n.color || "#7c3aed" }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: n.color || "#7c3aed" }}>
                        {n.tag || "General"}
                      </span>
                    </div>
                    <button onClick={() => removeFav(n._id)} className="cursor-pointer"
                      style={{ border: "none", background: "transparent", color: "#ec4899" }}>
                      <FiHeart size={16} style={{ fill: "#ec4899" }} />
                    </button>
                  </div>
                  <h3 className="text-base font-bold mb-1.5 line-clamp-1" style={{ color: txt }}>{n.title}</h3>
                  <p className="text-sm leading-relaxed line-clamp-3 mb-3 whitespace-pre-wrap" style={{ color: sub }}>{n.description}</p>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: muted }}>
                    <FiClock size={12} /> {fmt(n.date)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
