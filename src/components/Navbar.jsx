import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import { FiSun, FiMoon, FiLogOut, FiLogIn, FiUserPlus } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const Navbar = ({ showAlert }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (showAlert) showAlert("Logged out successfully", "success");
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div
              className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-600"
              style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(99,102,241,0.3)" }}
            >
              <span className="text-white font-bold text-lg">i</span>
            </div>
            <span className="text-xl font-bold gradient-text">iNotebook</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-4 py-2 text-sm font-medium transition-all duration-200 no-underline"
                style={{
                  borderRadius: "8px",
                  background: location.pathname === link.path
                    ? "rgba(99,102,241,0.1)"
                    : "transparent",
                  color: location.pathname === link.path
                    ? (darkMode ? "#818cf8" : "#4f46e5")
                    : (darkMode ? "#94a3b8" : "#64748b"),
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 transition-all duration-200 cursor-pointer"
              style={{
                background: darkMode ? "#334155" : "#f1f5f9",
                border: "none",
                borderRadius: "12px",
                color: darkMode ? "#facc15" : "#64748b",
              }}
              aria-label="Toggle theme"
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 font-medium text-sm transition-all duration-200 cursor-pointer"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#ef4444",
                  border: "none",
                  borderRadius: "12px",
                }}
              >
                <FiLogOut size={16} />
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 font-medium text-sm transition-all duration-200 no-underline"
                  style={{
                    borderRadius: "12px",
                    color: darkMode ? "#94a3b8" : "#64748b",
                  }}
                >
                  <FiLogIn size={16} />
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200 no-underline"
                  style={{ borderRadius: "12px" }}
                >
                  <FiUserPlus size={16} />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 transition-all cursor-pointer"
              style={{
                background: darkMode ? "#334155" : "#f1f5f9",
                border: "none",
                borderRadius: "8px",
                color: darkMode ? "#facc15" : "#64748b",
              }}
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 transition-all cursor-pointer"
              style={{
                border: "none",
                background: "transparent",
                borderRadius: "8px",
                color: darkMode ? "#94a3b8" : "#64748b",
              }}
            >
              {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
          >
            <div
              className="px-4 pb-4 space-y-2"
              style={{ borderTop: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium transition-all no-underline"
                  style={{
                    borderRadius: "12px",
                    background: location.pathname === link.path
                      ? "rgba(99,102,241,0.1)"
                      : "transparent",
                    color: location.pathname === link.path
                      ? "#6366f1"
                      : (darkMode ? "#94a3b8" : "#64748b"),
                  }}
                >
                  {link.label}
                </Link>
              ))}

              <div style={{ paddingTop: "8px", borderTop: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}` }}>
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 font-medium text-sm cursor-pointer"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                      border: "none",
                      borderRadius: "12px",
                    }}
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center px-4 py-3 font-medium text-sm no-underline"
                      style={{
                        borderRadius: "12px",
                        background: darkMode ? "#334155" : "#f1f5f9",
                        color: darkMode ? "#94a3b8" : "#64748b",
                      }}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center px-4 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white font-medium text-sm no-underline"
                      style={{ borderRadius: "12px" }}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
