import { motion } from "framer-motion";
import { FiShield, FiCloud, FiSmartphone, FiZap, FiLock, FiHeart } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const features = [
  {
    icon: <FiCloud size={24} />,
    title: "Cloud Synced",
    description: "Your notes are securely stored in the cloud, accessible from anywhere at any time.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: <FiShield size={24} />,
    title: "Secure & Private",
    description: "End-to-end encryption ensures your notes stay private. Only you can access them.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: <FiZap size={24} />,
    title: "Lightning Fast",
    description: "Optimized performance with instant loading. No lag, no waiting — just productivity.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: <FiSmartphone size={24} />,
    title: "Fully Responsive",
    description: "Works beautifully on any device — desktop, tablet, or mobile phone.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: <FiLock size={24} />,
    title: "JWT Authentication",
    description: "Industry-standard token-based authentication keeps your account protected.",
    gradient: "from-red-500 to-rose-500",
  },
  {
    icon: <FiHeart size={24} />,
    title: "Built with Love",
    description: "Crafted with modern technologies — React, Node.js, Express, and MongoDB.",
    gradient: "from-primary-500 to-violet-500",
  },
];

const About = () => {
  const { darkMode } = useTheme();

  return (
    <div className="py-8 sm:py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span
          className="inline-block px-4 py-1.5 text-xs font-semibold mb-4"
          style={{
            borderRadius: "9999px",
            background: darkMode ? "rgba(99,102,241,0.1)" : "#eef2ff",
            color: darkMode ? "#818cf8" : "#4f46e5",
          }}
        >
          ABOUT iNOTEBOOK
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: darkMode ? "#f1f5f9" : "#1e293b" }}>
          Your Notes, <span className="gradient-text">Secured</span> in the Cloud
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
          iNotebook is a modern, secure cloud notebook that helps you organize your thoughts,
          ideas, and important notes — all in one place.
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-6 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: darkMode ? "#1e293b" : "#ffffff",
              border: `1px solid ${darkMode ? "#475569" : "#c7d2fe"}`,
              borderRadius: "16px",
              boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 16px rgba(99,102,241,0.06), 0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className={`w-12 h-12 flex items-center justify-center text-white mb-4 bg-gradient-to-br ${feature.gradient}`}
              style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            >
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: darkMode ? "#f1f5f9" : "#1e293b" }}>
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-16 p-8 text-center"
        style={{
          background: darkMode
            ? "linear-gradient(to bottom right, #1e293b, #334155)"
            : "linear-gradient(to bottom right, #eef2ff, #f5f3ff)",
          border: `1px solid ${darkMode ? "#334155" : "#c7d2fe"}`,
          borderRadius: "16px",
        }}
      >
        <h2 className="text-2xl font-bold mb-3" style={{ color: darkMode ? "#f1f5f9" : "#1e293b" }}>
          Built with Modern Tech Stack
        </h2>
        <p className="text-sm mb-6" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
          Powered by the latest and most reliable technologies
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "Framer Motion", "JWT"].map(
            (tech) => (
              <span
                key={tech}
                className="px-4 py-2 text-sm font-medium"
                style={{
                  background: darkMode ? "#334155" : "#ffffff",
                  color: darkMode ? "#94a3b8" : "#1e293b",
                  border: `1px solid ${darkMode ? "#475569" : "#e2e8f0"}`,
                  borderRadius: "12px",
                  boxShadow: darkMode ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                {tech}
              </span>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default About;
