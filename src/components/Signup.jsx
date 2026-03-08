import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiEdit3, FiCloud, FiLayers } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 5) score++;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

const strengthLabels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColors = ["", "#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4"];

export default function Signup({ showAlert }) {
  const [f, setF] = useState({ name: "", email: "", password: "", cpassword: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const host = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const set = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const match = f.cpassword === "" || f.password === f.cpassword;
  const strength = getStrength(f.password);

  const submit = async (e) => {
    e.preventDefault();
    if (f.password !== f.cpassword) { showAlert("Passwords do not match", "danger"); return; }
    setLoading(true);
    try {
      const r = await fetch(`${host}/api/auth/createuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.name, email: f.email, password: f.password }),
      });
      const j = await r.json();
      if (j.success) {
        localStorage.setItem("token", j.authToken);
        showAlert("Account created!", "success");
        navigate("/");
      } else {
        showAlert(j.error || "Failed to create account", "danger");
      }
    } catch {
      showAlert("Something went wrong. Please try again.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const iconStyle = { color: dark ? "#64748b" : "#94a3b8" };
  const labelStyle = { color: dark ? "#94a3b8" : "#64748b" };

  return (
    <div className="auth-split" style={{ background: dark ? "#050810" : "#fafbff" }}>
      {/* Left - Brand */}
      <div className="auth-brand">
        <div className="brand-grid" />
        <div className="floating-shapes">
          <span /><span /><span /><span />
        </div>
        <div className="relative z-10 flex flex-col justify-center items-start p-12 lg:p-16 h-full">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <span className="text-white text-2xl font-bold">i</span>
              </div>
              <span className="text-white text-2xl font-bold">iNotebook</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Start your<br />
              <span style={{ color: "#06b6d4" }}>productivity</span><br />
              journey.
            </h1>

            <p className="text-base text-indigo-200 mb-10 max-w-sm leading-relaxed" style={{ opacity: 0.8 }}>
              Join thousands who trust iNotebook to keep their ideas safe and organized.
            </p>

            <div className="space-y-4">
              {[
                { icon: <FiEdit3 size={18} />, text: "Rich note editing" },
                { icon: <FiCloud size={18} />, text: "Sync across devices" },
                { icon: <FiLayers size={18} />, text: "Organize with tags" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(6,182,212,0.2)", color: "#06b6d4" }}>{item.icon}</div>
                  <span className="text-sm font-medium text-indigo-100">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="auth-form">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-10 md:mb-12">
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#7c3aed" }}>
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
            <h2 className="text-3xl font-bold mb-2" style={{ color: dark ? "#f1f5f9" : "#0f172a" }}>Create account</h2>
            <p className="text-sm" style={{ color: dark ? "#64748b" : "#94a3b8" }}>Fill in your details to get started</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={labelStyle}>Full Name</label>
              <div className="relative">
                <FiUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={iconStyle} />
                <input type="text" name="name" value={f.name} onChange={set} placeholder="John Doe" minLength={3} required
                  className="input-modern" style={{ paddingLeft: 44 }} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={labelStyle}>Email</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={iconStyle} />
                <input type="email" name="email" value={f.email} onChange={set} placeholder="you@example.com" required
                  className="input-modern" style={{ paddingLeft: 44 }} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={labelStyle}>Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={iconStyle} />
                <input type={showPw ? "text" : "password"} name="password" value={f.password} onChange={set}
                  placeholder="Min. 5 characters" minLength={5} required
                  className="input-modern" style={{ paddingLeft: 44, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} aria-label="Toggle password"
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex cursor-pointer"
                  style={{ background: "transparent", border: "none", ...iconStyle }}>
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {/* Password Strength Meter */}
              {f.password && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength ? strengthColors[strength] : (dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.7)"),
                        transition: "all 0.3s",
                      }} />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </p>
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={labelStyle}>Confirm Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={iconStyle} />
                <input type="password" name="cpassword" value={f.cpassword} onChange={set}
                  placeholder="Re-enter password" minLength={5} required
                  className="input-modern" style={{ paddingLeft: 44, ...(!match ? { borderColor: "#ef4444", boxShadow: "0 0 0 4px rgba(239,68,68,0.08)" } : {}) }} />
              </div>
              {!match && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs mt-1.5 font-medium" style={{ color: "#ef4444" }}>
                  Passwords don&apos;t match
                </motion.p>
              )}
            </div>

            <motion.button type="submit" disabled={loading || !match}
              whileHover={!(loading || !match) ? { scale: 1.01 } : {}}
              whileTap={!(loading || !match) ? { scale: 0.99 } : {}}
              className="w-full btn-primary" style={{ marginTop: 24 }}>
              {loading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Creating...</>
              ) : (
                <>Create account <FiArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <p className="text-center mt-8 text-sm" style={{ color: dark ? "#64748b" : "#94a3b8" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold no-underline" style={{ color: "#7c3aed" }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
