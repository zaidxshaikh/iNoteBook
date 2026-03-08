import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiUserPlus, FiEye, FiEyeOff } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const IconWrapper = ({ children, darkMode }) => (
  <span
    style={{
      position: "absolute",
      left: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "none",
      color: darkMode ? "#64748b" : "#9ca3af",
    }}
  >
    {children}
  </span>
);

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

  const inputStyle = {
    background: darkMode ? "#1e293b" : "#f8fafc",
    border: `1px solid ${darkMode ? "#475569" : "#d1d5db"}`,
    borderRadius: "12px",
    color: darkMode ? "#f1f5f9" : "#1e293b",
  };

  const inputFocusHandler = (e) => {
    e.target.style.borderColor = "#6366f1";
    e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)";
  };

  const inputBlurHandler = (e) => {
    e.target.style.borderColor = darkMode ? "#475569" : "#d1d5db";
    e.target.style.boxShadow = "none";
  };

  const passwordsMatch =
    credentials.cpassword === "" || credentials.password === credentials.cpassword;

  return (
    <div style={{ minHeight: "calc(100vh - 12rem)" }} className="flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 flex items-center justify-center mb-4 bg-gradient-to-br from-primary-500 to-purple-600"
            style={{ borderRadius: "16px", boxShadow: "0 10px 30px rgba(99, 102, 241, 0.3)" }}
          >
            <FiUserPlus className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: darkMode ? "#f1f5f9" : "#1e293b" }}>
            Create an account
          </h1>
          <p style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
            Start organizing your notes today
          </p>
        </div>

        <div
          className="p-6 sm:p-8"
          style={{
            background: darkMode ? "#1e293b" : "#ffffff",
            border: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
            borderRadius: "16px",
            boxShadow: darkMode ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: darkMode ? "#94a3b8" : "#1e293b" }}>
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <IconWrapper darkMode={darkMode}><FiUser size={16} /></IconWrapper>
                <input
                  type="text"
                  name="name"
                  value={credentials.name}
                  onChange={onChange}
                  placeholder="John Doe"
                  minLength={3}
                  required
                  className="w-full py-3 transition-all duration-200 outline-none"
                  style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "16px" }}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: darkMode ? "#94a3b8" : "#1e293b" }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <IconWrapper darkMode={darkMode}><FiMail size={16} /></IconWrapper>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  required
                  className="w-full py-3 transition-all duration-200 outline-none"
                  style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "16px" }}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: darkMode ? "#64748b" : "#94a3b8" }}>
                We&apos;ll never share your email with anyone.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: darkMode ? "#94a3b8" : "#1e293b" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <IconWrapper darkMode={darkMode}><FiLock size={16} /></IconWrapper>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credentials.password}
                  onChange={onChange}
                  placeholder="Min. 5 characters"
                  minLength={5}
                  required
                  className="w-full py-3 transition-all duration-200 outline-none"
                  style={{ ...inputStyle, paddingLeft: "42px", paddingRight: "42px" }}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    background: "transparent",
                    border: "none",
                    color: darkMode ? "#64748b" : "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: darkMode ? "#94a3b8" : "#1e293b" }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <IconWrapper darkMode={darkMode}><FiLock size={16} /></IconWrapper>
                <input
                  type="password"
                  name="cpassword"
                  value={credentials.cpassword}
                  onChange={onChange}
                  placeholder="Re-enter your password"
                  minLength={5}
                  required
                  className="w-full py-3 transition-all duration-200 outline-none"
                  style={{
                    ...inputStyle,
                    paddingLeft: "42px",
                    paddingRight: "16px",
                    borderColor: !passwordsMatch ? "#ef4444" : (darkMode ? "#475569" : "#d1d5db"),
                    boxShadow: !passwordsMatch ? "0 0 0 3px rgba(239,68,68,0.15)" : "none",
                  }}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>
              {!passwordsMatch && (
                <p className="text-xs mt-1" style={{ color: "#ef4444" }}>Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !passwordsMatch}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer disabled:opacity-50 mt-2"
              style={{ border: "none", borderRadius: "12px" }}
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

        <p className="text-center mt-6 text-sm" style={{ color: darkMode ? "#94a3b8" : "#64748b" }}>
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
