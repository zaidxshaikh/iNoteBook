import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch, FiX, FiEdit3, FiGrid, FiList, FiFilter, FiBookOpen,
  FiDownload, FiCheckSquare, FiTrash2, FiDroplet, FiCommand, FiUpload,
} from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";
import Noteitem from "./Noteitem";
import Addnotes from "./Addnotes";
import { useNavigate } from "react-router-dom";

const colorPalette = [
  "#7c3aed", "#3b82f6", "#06b6d4", "#10b981",
  "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6",
  "#f97316", "#14b8a6", "#6366f1", "#84cc16",
];

const shortcuts = [
  { keys: "Ctrl + N", desc: "Focus new note form" },
  { keys: "Escape", desc: "Close modals" },
  { keys: "?", desc: "Toggle shortcuts panel" },
  { keys: "Ctrl + E", desc: "Toggle bulk select" },
  { keys: "Ctrl + Shift + E", desc: "Export notes" },
];

export default function Notes({ showAlert, notifications }) {
  const { notes, getNotes, editNote, bulkDelete, addNote, loading } = useContext(noteContext);
  const { dark } = useTheme();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("newest");
  const [tag, setTag] = useState("all");
  const [cur, setCur] = useState({ id: "", etitle: "", edescription: "", etag: "", ecolor: "#7c3aed" });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    if (localStorage.getItem("token")) getNotes();
    else navigate("/login");
  }, [getNotes, navigate]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") { setModal(false); setShowShortcuts(false); setSelectMode(false); setSelected(new Set()); }
      if (e.key === "?" && !modal && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        setShowShortcuts((p) => !p);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "e" && !e.shiftKey) {
        e.preventDefault();
        setSelectMode((p) => { if (p) setSelected(new Set()); return !p; });
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "E") {
        e.preventDefault();
        exportNotes();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal, notes]);

  const openEdit = (n) => {
    setCur({ id: n._id, etitle: n.title, edescription: n.description, etag: n.tag, ecolor: n.color || "#7c3aed" });
    setModal(true);
  };

  const saveEdit = async () => {
    const ok = await editNote(cur.id, cur.etitle, cur.edescription, cur.etag, cur.ecolor);
    showAlert(ok ? "Note updated" : "Update failed", ok ? "success" : "danger");
    setModal(false);
  };

  const exportNotes = () => {
    if (notes.length === 0) { showAlert("No notes to export", "info"); return; }
    const data = JSON.stringify(notes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inotebook-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert("Notes exported!", "success");
  };

  const exportAsText = () => {
    if (notes.length === 0) { showAlert("No notes to export", "info"); return; }
    const text = notes.map((n) =>
      `# ${n.title}\nTag: ${n.tag || "General"}\nDate: ${new Date(n.date).toLocaleString()}\n\n${n.description}\n\n---`
    ).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inotebook-export-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert("Notes exported as text!", "success");
  };

  const importNotes = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const arr = Array.isArray(data) ? data : [data];
        let count = 0;
        for (const n of arr) {
          if (n.title && n.description) {
            await addNote(n.title, n.description, n.tag || "Imported", n.color);
            count++;
          }
        }
        showAlert(`${count} note${count !== 1 ? "s" : ""} imported!`, "success");
      } catch {
        showAlert("Invalid JSON file", "danger");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === list.length) setSelected(new Set());
    else setSelected(new Set(list.map((n) => n._id)));
  };

  const doBulkDelete = async () => {
    if (selected.size === 0) return;
    const ok = await bulkDelete([...selected]);
    showAlert(ok ? `${selected.size} notes deleted` : "Failed", ok ? "success" : "danger");
    setSelected(new Set());
    setSelectMode(false);
  };

  const uniqueTags = [...new Set(notes.map((n) => n.tag || "General"))];

  const list = notes
    .filter((n) => {
      const q = search.toLowerCase();
      const mq = n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q) || (n.tag || "").toLowerCase().includes(q);
      const mt = tag === "all" || (n.tag || "General") === tag;
      return mq && mt;
    })
    .sort((a, b) => {
      if (a.tag === "Pinned" && b.tag !== "Pinned") return -1;
      if (b.tag === "Pinned" && a.tag !== "Pinned") return 1;
      if (sort === "newest") return new Date(b.date) - new Date(a.date);
      if (sort === "oldest") return new Date(a.date) - new Date(b.date);
      return a.title.localeCompare(b.title);
    });

  const editOk = cur.etitle.length >= 4 && cur.edescription.length >= 5;
  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  return (
    <>
      <Addnotes showAlert={showAlert} />

      <div className="mt-10 mb-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: txt }}>Your Notes</h2>
              <p className="text-sm mt-0.5" style={{ color: muted }}>
                {list.length} of {notes.length} {notes.length === 1 ? "note" : "notes"}
              </p>
            </div>

            {notes.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Shortcuts */}
                <button onClick={() => setShowShortcuts(!showShortcuts)} title="Shortcuts (?)"
                  className="p-2 cursor-pointer"
                  style={{ border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                    borderRadius: 8, background: "transparent", color: muted }}>
                  <FiCommand size={15} />
                </button>

                {/* Bulk select */}
                <button onClick={() => { setSelectMode(!selectMode); setSelected(new Set()); }}
                  title="Bulk select (Ctrl+E)"
                  className="p-2 cursor-pointer"
                  style={{ border: `1px solid ${selectMode ? "rgba(124,58,237,0.4)" : dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                    borderRadius: 8, background: selectMode ? "rgba(124,58,237,0.1)" : "transparent",
                    color: selectMode ? "#7c3aed" : muted }}>
                  <FiCheckSquare size={15} />
                </button>

                {/* Export */}
                <div className="relative group/export">
                  <button title="Export notes (Ctrl+Shift+E)"
                    className="p-2 cursor-pointer"
                    style={{ border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                      borderRadius: 8, background: "transparent", color: muted }}>
                    <FiDownload size={15} />
                  </button>
                  <div className="absolute right-0 top-full mt-1 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-20"
                    style={{ minWidth: 140 }}>
                    <div className="card p-1.5" style={{ borderRadius: 10 }}>
                      <button onClick={exportNotes}
                        className="w-full text-left px-3 py-2 text-xs font-medium cursor-pointer"
                        style={{ border: "none", borderRadius: 6, background: "transparent", color: sub }}>
                        Export as JSON
                      </button>
                      <button onClick={exportAsText}
                        className="w-full text-left px-3 py-2 text-xs font-medium cursor-pointer"
                        style={{ border: "none", borderRadius: 6, background: "transparent", color: sub }}>
                        Export as Text
                      </button>
                    </div>
                  </div>
                </div>

                {/* Import */}
                <label title="Import notes from JSON"
                  className="p-2 cursor-pointer"
                  style={{ border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                    borderRadius: 8, background: "transparent", color: muted, display: "flex" }}>
                  <FiUpload size={15} />
                  <input type="file" accept=".json" onChange={importNotes} style={{ display: "none" }} />
                </label>

                {/* View toggle */}
                <div className="flex p-0.5 rounded-lg"
                  style={{ background: dark ? "rgba(51,65,85,0.35)" : "rgba(241,245,249,0.7)",
                    border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}` }}>
                  {[{ m: "grid", I: FiGrid }, { m: "list", I: FiList }].map(({ m, I }) => (
                    <button key={m} onClick={() => setView(m)} className="p-2 cursor-pointer"
                      style={{ border: "none", borderRadius: 6,
                        background: view === m ? "#7c3aed" : "transparent",
                        color: view === m ? "#fff" : muted,
                        boxShadow: view === m ? "0 2px 8px rgba(124,58,237,0.3)" : "none" }}>
                      <I size={15} />
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: muted }} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                    className="input-modern text-sm" style={{ paddingLeft: 38, paddingRight: 38, padding: "10px 38px" }} />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ border: "none", background: "transparent", color: muted }}><FiX size={15} /></button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bulk actions bar */}
          <AnimatePresence>
            {selectMode && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: dark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.04)",
                  border: `1px solid ${dark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.1)"}` }}>
                <button onClick={selectAll}
                  className="text-xs font-semibold px-3 py-1.5 cursor-pointer"
                  style={{ background: "transparent", border: `1px solid ${dark ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.2)"}`,
                    borderRadius: 8, color: "#7c3aed" }}>
                  {selected.size === list.length ? "Deselect all" : "Select all"}
                </button>
                <span className="text-xs font-medium" style={{ color: "#7c3aed" }}>
                  {selected.size} selected
                </span>
                {selected.size > 0 && (
                  <button onClick={doBulkDelete}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 cursor-pointer ml-auto"
                    style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8,
                      boxShadow: "0 2px 8px rgba(239,68,68,0.25)" }}>
                    <FiTrash2 size={12} /> Delete {selected.size}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shortcuts panel */}
          <AnimatePresence>
            {showShortcuts && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="card p-5 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold" style={{ color: txt }}>Keyboard Shortcuts</h3>
                  <button onClick={() => setShowShortcuts(false)} className="cursor-pointer"
                    style={{ border: "none", background: "transparent", color: muted }}>
                    <FiX size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {shortcuts.map((s) => (
                    <div key={s.keys} className="flex items-center justify-between py-1.5">
                      <span className="text-xs" style={{ color: sub }}>{s.desc}</span>
                      <kbd className="text-xs px-2 py-0.5" style={{
                        background: dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.7)",
                        border: `1px solid ${dark ? "rgba(71,85,105,0.3)" : "rgba(203,213,225,0.5)"}`,
                        borderRadius: 5, color: muted, fontFamily: "inherit",
                      }}>{s.keys}</kbd>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters */}
          {notes.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <FiFilter size={13} style={{ color: muted, flexShrink: 0 }} />
                <button onClick={() => setTag("all")} className={`chip ${tag === "all" ? "chip-on" : "chip-off"}`}>All</button>
                {uniqueTags.map((t) => (
                  <button key={t} onClick={() => setTag(t)} className={`chip ${tag === t ? "chip-on" : "chip-off"}`}>{t}</button>
                ))}
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <span className="text-xs" style={{ color: muted }}>Sort:</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}
                  className="text-xs px-3 py-1.5 cursor-pointer outline-none"
                  style={{ background: dark ? "rgba(51,65,85,0.35)" : "rgba(255,255,255,0.6)",
                    border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                    borderRadius: 8, color: sub, backdropFilter: "blur(8px)" }}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title">A-Z</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full" style={{ border: "3px solid transparent", borderTopColor: "#7c3aed", animation: "spin 0.7s linear infinite" }} />
                <div className="absolute inset-1 rounded-full" style={{ border: "3px solid transparent", borderBottomColor: "#06b6d4", animation: "spin 1s linear infinite reverse" }} />
              </div>
              <p className="text-sm" style={{ color: muted }}>Loading notes...</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && notes.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-24">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: dark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)",
                border: `1px solid ${dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)"}` }}>
              <FiBookOpen size={36} style={{ color: "#7c3aed" }} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: txt }}>Start writing</h3>
            <p className="text-sm text-center max-w-xs" style={{ color: muted }}>Create your first note and begin organizing your thoughts</p>
          </motion.div>
        )}

        {/* No results */}
        {!loading && notes.length > 0 && list.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <FiSearch size={24} style={{ color: muted }} />
            <p className="text-sm mt-3 mb-2" style={{ color: sub }}>Nothing found</p>
            <button onClick={() => { setSearch(""); setTag("all"); }}
              className="text-xs font-semibold cursor-pointer"
              style={{ border: "none", background: "transparent", color: "#7c3aed" }}>Clear filters</button>
          </div>
        )}

        {/* Notes */}
        {!loading && list.length > 0 && (
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
            <AnimatePresence mode="popLayout">
              {list.map((n, i) => (
                <motion.div key={n._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}>
                  <Noteitem note={n} updateNote={openEdit} showAlert={showAlert}
                    selectable={selectMode} selected={selected.has(n._id)} onSelect={toggleSelect}
                    notifications={notifications} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            onClick={() => setModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg card p-6 sm:p-8">

              {/* Color bar */}
              <div style={{ height: 3, background: `linear-gradient(to right, ${cur.ecolor}, ${cur.ecolor}88)`,
                borderRadius: "20px 20px 0 0", position: "absolute", top: 0, left: 0, right: 0 }} />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: cur.ecolor, boxShadow: `0 4px 14px ${cur.ecolor}4D`, transition: "all 0.3s" }}>
                  <FiEdit3 className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: txt }}>Edit Note</h3>
                  <p className="text-xs" style={{ color: muted }}>Esc to cancel</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: sub }}>Title</label>
                  <input value={cur.etitle} onChange={(e) => setCur({ ...cur, etitle: e.target.value })} className="input-modern" />
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: sub }}>Description</label>
                    <span className="text-xs" style={{ color: muted }}>
                      {cur.edescription.trim().split(/\s+/).filter(Boolean).length}w {cur.edescription.length}c
                    </span>
                  </div>
                  <textarea value={cur.edescription} rows={4} onChange={(e) => setCur({ ...cur, edescription: e.target.value })}
                    className="input-modern" style={{ resize: "none" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: sub }}>Tag</label>
                  <input value={cur.etag} onChange={(e) => setCur({ ...cur, etag: e.target.value })} className="input-modern" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: sub }}>
                    <FiDroplet size={12} /> Card Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colorPalette.map((c) => (
                      <button key={c} type="button" onClick={() => setCur({ ...cur, ecolor: c })}
                        className="cursor-pointer"
                        style={{
                          width: 26, height: 26, borderRadius: 7, background: c, border: "none",
                          outline: cur.ecolor === c ? `2px solid ${c}` : "none",
                          outlineOffset: 2, transform: cur.ecolor === c ? "scale(1.15)" : "scale(1)",
                          transition: "all 0.2s", boxShadow: `0 2px 8px ${c}40`,
                        }} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                <button onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
                <motion.button disabled={!editOk} onClick={saveEdit}
                  whileHover={editOk ? { scale: 1.02 } : {}} whileTap={editOk ? { scale: 0.98 } : {}}
                  className="btn-primary"
                  style={!editOk ? { background: dark ? "rgba(51,65,85,0.3)" : "#e2e8f0", color: muted, boxShadow: "none", cursor: "not-allowed" } : {}}>
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
