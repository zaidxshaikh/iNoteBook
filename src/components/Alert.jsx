import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const Alert = ({ alert }) => {
  const { darkMode } = useTheme();

  const config = {
    success: {
      icon: <FiCheckCircle size={20} />,
      bg: darkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200",
      text: darkMode ? "text-emerald-400" : "text-emerald-700",
      iconColor: "text-emerald-500",
    },
    danger: {
      icon: <FiAlertCircle size={20} />,
      bg: darkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200",
      text: darkMode ? "text-red-400" : "text-red-700",
      iconColor: "text-red-500",
    },
    info: {
      icon: <FiInfo size={20} />,
      bg: darkMode ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200",
      text: darkMode ? "text-blue-400" : "text-blue-700",
      iconColor: "text-blue-500",
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
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${
              (config[alert.type] || config.info).bg
            }`}
          >
            <span className={(config[alert.type] || config.info).iconColor}>
              {(config[alert.type] || config.info).icon}
            </span>
            <p className={`text-sm font-medium flex-1 ${(config[alert.type] || config.info).text}`}>
              {alert.msg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Alert;
