import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiArrowRight, FiBookOpen, FiShield, FiZap } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function Login({ showAlert }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const host = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Auto-login from QR code / connect device link
  useEffect(() => {
    const autoToken = searchParams.get("auto");
    if (autoToken) {
      localStorage.setItem("token", autoToken);
      showAlert("Connected! Syncing your notes...", "success");
      navigate("/");
    }
  }, [searchParams, navigate, showAlert]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (email === "demo@inotebook.com" && password === "demo123") {
      localStorage.setItem("token", "demo-token-inotebook");
      showAlert("Welcome to demo mode!", "success");
      setLoading(false);
      navigate("/");
      return;
    }

    try {
      const r = await fetch(`${host}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json();
      if (j.success) {
        localStorage.setItem("token", j.authToken);
        showAlert("Welcome back!", "success");
        navigate("/");
      } else {
        showAlert("Invalid email or password", "danger");
      }
    } catch {
      showAlert("Server unavailable. Try demo: demo@inotebook.com / demo123", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split" style={{ background: dark ? "#050810" : "#fafbff" }}>
      {/* Left - Brand Panel */}
      <div className="auth-brand">
        <div className="brand-grid" />
        <div className="floating-shapes">
          <span /><span /><span /><span />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-start p-12 lg:p-16 h-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <span className="text-white text-2xl font-bold">i</span>
              </div>
              <span className="text-white text-2xl font-bold">iNotebook</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Your thoughts,<br />
              <span style={{ color: "#06b6d4" }}>beautifully</span><br />
              organized.
            </h1>

            <p className="text-base text-indigo-200 mb-10 max-w-sm leading-relaxed" style={{ opacity: 0.8 }}>
              The smartest way to capture ideas, organize notes, and stay productive — all in one place.
            </p>

            <div className="space-y-4">
              {[
                { icon: <FiBookOpen size={18} />, text: "Capture notes instantly" },
                { icon: <FiShield size={18} />, text: "Secure cloud storage" },
                { icon: <FiZap size={18} />, text: "Lightning fast search" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(6,182,212,0.2)", color: "#06b6d4" }}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-indigo-100">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="auth-form">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center justify-between mb-10 md:mb-12">
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#7c3aed" }}>
                <span className="text-white text-lg font-bold">i</span>
              </div>
              <span className="text-lg font-bold text-gradient">iNotebook</span>
            </div>
            <button onClick={toggle} className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
              style={{ background: dark ? "rgba(51,65,85,0.4)" : "rgba(241,245,249,0.8)", border: "none", color: dark ? "#94a3b8" : "#64748b" }}>
              {dark ? "Light" : "Dark"}
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: dark ? "#f1f5f9" : "#0f172a" }}>
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: dark ? "#64748b" : "#94a3b8" }}>
              Enter your credentials to access your notes
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: dark ? "#94a3b8" : "#64748b" }}>Email</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: dark ? "#64748b" : "#94a3b8" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="input-modern" style={{ paddingLeft: 44 }} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: dark ? "#94a3b8" : "#64748b" }}>Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: dark ? "#64748b" : "#94a3b8" }} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password" minLength={5} required
                  className="input-modern" style={{ paddingLeft: 44 }} />
              </div>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              className="w-full btn-primary"
              style={{ marginTop: 28 }}>
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Signing in...
                </>
              ) : (
                <>Sign in <FiArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-3 rounded-xl text-center"
            style={{ background: dark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)", border: `1px solid ${dark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)"}` }}>
            <p className="text-xs" style={{ color: dark ? "#a78bfa" : "#7c3aed" }}>
              Try demo: <strong>demo@inotebook.com</strong> / <strong>demo123</strong>
            </p>
          </div>

          <p className="text-center mt-8 text-sm" style={{ color: dark ? "#64748b" : "#94a3b8" }}>
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-semibold no-underline" style={{ color: "#7c3aed" }}>Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
