import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiUserPlus, FiEye, FiEyeOff } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const Signup = ({ showAlert }) => {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const host = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (credentials.password !== credentials.cpassword) {
      showAlert("Passwords do not match", "danger");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${host}/api/auth/createuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
        }),
      });
      const json = await response.json();
      if (json.success) {
        localStorage.setItem("token", json.authToken);
        showAlert("Account created successfully!", "success");
        navigate("/");
      } else {
        showAlert(json.error || "Failed to create account", "danger");
      }
    } catch (error) {
      showAlert("Something went wrong. Please try again.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl border transition-all duration-200 outline-none ${
    darkMode
      ? "bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
  }`;

  const passwordsMatch =
    credentials.cpassword === "" || credentials.password === credentials.cpassword;

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
            <FiUserPlus className="text-white" size={28} />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Create an account
          </h1>
          <p className={`${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            Start organizing your notes today
          </p>
        </div>

        <div className={`rounded-2xl p-6 sm:p-8 ${
          darkMode
            ? "bg-slate-900/50 border border-slate-800"
            : "bg-white border border-gray-100 shadow-sm"
        }`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                Full Name
              </label>
              <div className="relative">
                <FiUser className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-gray-400"}`} size={16} />
                <input
                  type="text"
                  name="name"
                  value={credentials.name}
                  onChange={onChange}
                  placeholder="John Doe"
                  minLength={3}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                Email address
              </label>
              <div className="relative">
                <FiMail className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-gray-400"}`} size={16} />
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                />
              </div>
              <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
                We&apos;ll never share your email with anyone.
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                Password
              </label>
              <div className="relative">
                <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-gray-400"}`} size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={onChange}
                  placeholder="Min. 5 characters"
                  minLength={5}
                  required
                  className={`${inputClass} !pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent ${
                    darkMode ? "text-slate-500" : "text-gray-400"
                  }`}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${darkMode ? "text-slate-300" : "text-gray-700"}`}>
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? "text-slate-500" : "text-gray-400"}`} size={16} />
                <input
                  type="password"
                  name="cpassword"
                  value={credentials.cpassword}
                  onChange={onChange}
                  placeholder="Re-enter your password"
                  minLength={5}
                  required
                  className={`${inputClass} ${
                    !passwordsMatch ? "!border-red-500 !ring-2 !ring-red-500/20" : ""
                  }`}
                />
              </div>
              {!passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordsMatch}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-primary-500/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border-none disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        <p className={`text-center mt-6 text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary-500 hover:text-primary-600 no-underline"
          >
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
