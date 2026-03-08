import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const Alert = ({ alert }) => {
  const { darkMode } = useTheme();

  const config = {
    success: {
      icon: <FiCheckCircle size={20} />,
      bg: darkMode ? "rgba(16,185,129,0.1)" : "#ecfdf5",
      border: darkMode ? "rgba(16,185,129,0.2)" : "#a7f3d0",
      text: darkMode ? "#34d399" : "#065f46",
      iconColor: "#10b981",
    },
    danger: {
      icon: <FiAlertCircle size={20} />,
      bg: darkMode ? "rgba(239,68,68,0.1)" : "#fef2f2",
      border: darkMode ? "rgba(239,68,68,0.2)" : "#fecaca",
      text: darkMode ? "#f87171" : "#991b1b",
      iconColor: "#ef4444",
    },
    info: {
      icon: <FiInfo size={20} />,
      bg: darkMode ? "rgba(59,130,246,0.1)" : "#eff6ff",
      border: darkMode ? "rgba(59,130,246,0.2)" : "#bfdbfe",
      text: darkMode ? "#60a5fa" : "#1e40af",
      iconColor: "#3b82f6",
    },
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 px-4 py-3"
            style={{
              background: (config[alert.type] || config.info).bg,
              border: `1px solid ${(config[alert.type] || config.info).border}`,
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
          >
            <span style={{ color: (config[alert.type] || config.info).iconColor }}>
              {(config[alert.type] || config.info).icon}
            </span>
            <p className="text-sm font-medium flex-1" style={{ color: (config[alert.type] || config.info).text }}>
              {alert.msg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Alert;
