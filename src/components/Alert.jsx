import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";

const cfg = {
  success: { icon: <FiCheckCircle size={18} />, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)" },
  danger:  { icon: <FiAlertCircle size={18} />, color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.15)" },
  info:    { icon: <FiInfo size={18} />,        color: "#3b82f6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.15)" },
};

export default function Alert({ alert }) {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
      <AnimatePresence>
        {alert && (() => {
          const s = cfg[alert.type] || cfg.info;
          return (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: s.bg, border: `1px solid ${s.border}`,
                borderRadius: 14, backdropFilter: "blur(16px)", boxShadow: `0 8px 24px ${s.border}` }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <p className="text-sm font-semibold flex-1" style={{ color: s.color }}>{alert.msg}</p>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
