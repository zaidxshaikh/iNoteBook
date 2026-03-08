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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 no-underline ${
                  location.pathname === link.path
                    ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                    : darkMode
                    ? "text-gray-300 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                darkMode
                  ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium text-sm transition-all duration-200 cursor-pointer border-none"
              >
                <FiLogOut size={16} />
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 no-underline ${
                    darkMode
                      ? "text-gray-300 hover:bg-white/5"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FiLogIn size={16} />
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-purple-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200 no-underline"
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
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                darkMode
                  ? "bg-slate-800 text-yellow-400"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
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
            <div className={`px-4 pb-4 space-y-2 ${darkMode ? "border-t border-slate-800" : "border-t border-gray-100"}`}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all no-underline ${
                    location.pathname === link.path
                      ? "bg-primary-500/10 text-primary-600"
                      : darkMode
                      ? "text-gray-300 hover:bg-white/5"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-500 font-medium text-sm cursor-pointer border-none"
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block text-center px-4 py-3 rounded-xl font-medium text-sm no-underline ${
                        darkMode ? "text-gray-300 bg-slate-800" : "text-gray-600 bg-gray-100"
                      }`}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-purple-600 text-white font-medium text-sm no-underline"
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
