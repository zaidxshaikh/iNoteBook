import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiUnlock, FiX, FiEye, FiEyeOff } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const LOCKS_KEY = "inotebook-locks";

function getLocks() {
  const s = localStorage.getItem(LOCKS_KEY);
  return s ? JSON.parse(s) : {};
}
function saveLocks(locks) {
  localStorage.setItem(LOCKS_KEY, JSON.stringify(locks));
}

export function isNoteLocked(noteId) {
  return !!getLocks()[noteId];
}

export function lockNote(noteId, password) {
  const locks = getLocks();
  locks[noteId] = password;
  saveLocks(locks);
}

export function unlockNoteCheck(noteId, password) {
  const locks = getLocks();
  return locks[noteId] === password;
}

export function removeLock(noteId) {
  const locks = getLocks();
  delete locks[noteId];
  saveLocks(locks);
}

// Lock/Unlock button component
export function LockButton({ noteId, showAlert }) {
  const { dark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const locked = isNoteLocked(noteId);
  const muted = dark ? "#64748b" : "#94a3b8";

  return (
    <>
      <button onClick={() => setShowModal(true)} title={locked ? "Unlock note" : "Lock note"}
        className="p-1.5 cursor-pointer hover:scale-110 transition-transform"
        style={{ border: "none", background: "transparent", borderRadius: 6,
          color: locked ? "#f59e0b" : muted }}>
        {locked ? <FiLock size={14} /> : <FiUnlock size={14} />}
      </button>

      <AnimatePresence>
        {showModal && (
          <LockModal noteId={noteId} locked={locked} showAlert={showAlert}
            onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

// Lock modal
function LockModal({ noteId, locked, showAlert, onClose }) {
  const { dark } = useTheme();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  const handleLock = () => {
    if (password.length < 3) { showAlert("Password must be at least 3 characters", "danger"); return; }
    lockNote(noteId, password);
    showAlert("Note locked!", "success");
    onClose();
  };

  const handleUnlock = () => {
    if (unlockNoteCheck(noteId, password)) {
      removeLock(noteId);
      showAlert("Note unlocked!", "success");
      onClose();
    } else {
      showAlert("Wrong password!", "danger");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: locked ? "rgba(245,158,11,0.1)" : "rgba(124,58,237,0.1)" }}>
            {locked ? <FiLock size={18} style={{ color: "#f59e0b" }} /> : <FiUnlock size={18} style={{ color: "#7c3aed" }} />}
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: txt }}>
              {locked ? "Unlock Note" : "Lock Note"}
            </h3>
            <p className="text-xs" style={{ color: muted }}>
              {locked ? "Enter password to unlock" : "Set a password to protect this note"}
            </p>
          </div>
        </div>

        <div className="relative mb-4">
          <input type={showPw ? "text" : "password"} value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={locked ? "Enter password" : "Set password (min 3 chars)"}
            className="input-modern"
            style={{ paddingRight: 44 }}
            onKeyDown={(e) => e.key === "Enter" && (locked ? handleUnlock() : handleLock())} />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ border: "none", background: "transparent", color: muted }}>
            {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={locked ? handleUnlock : handleLock}
            className="flex-1 btn-primary" style={{ padding: "10px 16px" }}>
            {locked ? "Unlock" : "Lock"}
          </button>
          <button onClick={onClose}
            className="btn-ghost" style={{ padding: "10px 16px" }}>
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Unlock gate - wraps note content, shows lock screen if locked
export function LockGate({ noteId, children, showAlert }) {
  const { dark } = useTheme();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const locked = isNoteLocked(noteId);

  if (!locked || unlocked) return children;

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const muted = dark ? "#64748b" : "#94a3b8";

  const tryUnlock = () => {
    if (unlockNoteCheck(noteId, password)) {
      setUnlocked(true);
    } else {
      showAlert("Wrong password!", "danger");
    }
  };

  return (
    <div className="p-5 pl-7 flex flex-col items-center justify-center" style={{ minHeight: 120 }}>
      <FiLock size={24} style={{ color: "#f59e0b", marginBottom: 12 }} />
      <p className="text-xs font-semibold mb-3" style={{ color: txt }}>This note is locked</p>
      <div className="flex gap-2 w-full max-w-[200px]">
        <div className="relative flex-1">
          <input type={showPw ? "text" : "password"} value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input-modern text-xs"
            style={{ padding: "8px 32px 8px 10px", fontSize: 12 }}
            onKeyDown={(e) => e.key === "Enter" && tryUnlock()} />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ border: "none", background: "transparent", color: muted }}>
            {showPw ? <FiEyeOff size={12} /> : <FiEye size={12} />}
          </button>
        </div>
        <button onClick={tryUnlock}
          className="px-3 text-xs font-semibold cursor-pointer"
          style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8 }}>
          Go
        </button>
      </div>
    </div>
  );
}
