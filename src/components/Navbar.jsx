import { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import { FiSun, FiMoon, FiLogOut, FiHome, FiInfo, FiTrash2, FiBell, FiSmartphone, FiWifi, FiWifiOff } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import noteContext from "../context/notes/noteContext";

const links = [
  { to: "/", label: "Home", icon: <FiHome size={16} /> },
  { to: "/reminders", label: "Reminders", icon: <FiBell size={16} />, badgeKey: "reminders" },
  { to: "/trash", label: "Trash", icon: <FiTrash2 size={16} />, badgeKey: "trash" },
  { to: "/connect", label: "Connect", icon: <FiSmartphone size={16} /> },
  { to: "/about", label: "About", icon: <FiInfo size={16} /> },
];

export default function Navbar({ showAlert, notifications, sync }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const { trash } = useContext(noteContext);
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    showAlert?.("Logged out", "success");
    navigate("/login");
    setOpen(false);
  };

  const txt = dark ? "#94a3b8" : "#64748b";
  const active = "#7c3aed";

  return (
    <nav className="sticky top-0 z-50 nav-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#7c3aed", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
            <span className="text-white font-bold text-base">i</span>
          </div>
          <span className="text-lg font-bold text-gradient">iNotebook</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const isActive = pathname === l.to;
            return (
              <Link key={l.to} to={l.to}
                className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium no-underline"
                style={{ borderRadius: 10, color: isActive ? active : txt }}>
                {isActive && (
                  <motion.div layoutId="nav-active" className="absolute inset-0"
                    style={{ borderRadius: 10, background: dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.06)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {l.icon} {l.label}
                  {l.badgeKey === "trash" && trash.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: "#ef4444", color: "#fff", fontSize: 10, minWidth: 18, textAlign: "center",
                        lineHeight: "1.2" }}>
                      {trash.length}
                    </span>
                  )}
                  {l.badgeKey === "reminders" && notifications?.upcomingReminders?.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: "#f59e0b", color: "#fff", fontSize: 10, minWidth: 18, textAlign: "center",
                        lineHeight: "1.2" }}>
                      {notifications.upcomingReminders.length}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Sync status */}
          {sync && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
              title={`Sync: ${sync.status} | Last: ${sync.timeSinceSync()}`}
              style={{ background: dark ? "rgba(51,65,85,0.2)" : "rgba(241,245,249,0.5)",
                border: `1px solid ${dark ? "rgba(51,65,85,0.2)" : "rgba(226,232,240,0.3)"}` }}>
              {sync.online ? (
                <FiWifi size={12} style={{ color: "#10b981" }} />
              ) : (
                <FiWifiOff size={12} style={{ color: "#ef4444" }} />
              )}
              <span className="text-xs font-medium" style={{
                color: sync.online ? "#10b981" : "#ef4444"
              }}>
                {sync.online ? "Synced" : "Offline"}
              </span>
            </div>
          )}

          <button onClick={toggle} className="p-2 cursor-pointer"
            style={{ background: "transparent", border: `1px solid ${dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.6)"}`,
              borderRadius: 10, color: dark ? "#facc15" : "#64748b" }}>
            {dark ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>

          {localStorage.getItem("token") && (
            <button onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold cursor-pointer"
              style={{ background: dark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)",
                color: "#ef4444", border: `1px solid ${dark ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.1)"}`, borderRadius: 10 }}>
              <FiLogOut size={14} /> Logout
            </button>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={toggle} className="p-2 cursor-pointer"
            style={{ background: "transparent", border: "none", color: dark ? "#facc15" : "#64748b" }}>
            {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <button onClick={() => setOpen(!open)} className="p-2 cursor-pointer"
            style={{ background: "transparent", border: "none", color: txt }}>
            {open ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t"
            style={{ borderColor: dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)" }}>
            <div className="px-4 pb-4 pt-2 space-y-1">
              {links.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium no-underline"
                  style={{ borderRadius: 10, color: pathname === l.to ? active : txt,
                    background: pathname === l.to ? (dark ? "rgba(124,58,237,0.1)" : "rgba(124,58,237,0.05)") : "transparent" }}>
                  {l.icon} {l.label}
                  {l.to === "/trash" && trash.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: "#ef4444", color: "#fff", fontSize: 10, minWidth: 18, textAlign: "center" }}>
                      {trash.length}
                    </span>
                  )}
                </Link>
              ))}
              {localStorage.getItem("token") && (
                <button onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium cursor-pointer mt-2"
                  style={{ background: "rgba(239,68,68,0.06)", color: "#ef4444", border: "none", borderRadius: 10 }}>
                  <FiLogOut size={14} /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
