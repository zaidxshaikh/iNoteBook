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
        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-4 ${
          darkMode
            ? "bg-primary-500/10 text-primary-400"
            : "bg-primary-50 text-primary-600"
        }`}>
          ABOUT iNOTEBOOK
        </span>
        <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
          Your Notes, <span className="gradient-text">Secured</span> in the Cloud
        </h1>
        <p className={`text-lg max-w-2xl mx-auto ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
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
            className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${
              darkMode
                ? "bg-slate-900/50 border border-slate-800 hover:border-slate-700"
                : "bg-white border border-gray-100 hover:shadow-lg"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
              {feature.icon}
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {feature.title}
            </h3>
            <p className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
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
        className={`mt-16 rounded-2xl p-8 text-center ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700"
            : "bg-gradient-to-br from-primary-50 to-purple-50 border border-primary-100"
        }`}
      >
        <h2 className={`text-2xl font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
          Built with Modern Tech Stack
        </h2>
        <p className={`text-sm mb-6 ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
          Powered by the latest and most reliable technologies
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "Framer Motion", "JWT"].map(
            (tech) => (
              <span
                key={tech}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${
                  darkMode
                    ? "bg-slate-800 text-slate-300 border border-slate-700"
                    : "bg-white text-gray-700 border border-gray-200 shadow-sm"
                }`}
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
