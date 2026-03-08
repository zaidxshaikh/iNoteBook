import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { FiSmartphone, FiMonitor, FiWifi, FiCheck, FiCopy, FiRefreshCw, FiX } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import { getConnectURL } from "../hooks/useSync";

export default function ConnectDevice({ showAlert }) {
  const { dark } = useTheme();
  const [copied, setCopied] = useState(false);
  const connectURL = getConnectURL();

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  const copyLink = () => {
    if (connectURL) {
      navigator.clipboard.writeText(connectURL);
      setCopied(true);
      showAlert("Link copied! Open it on your phone", "success");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!connectURL) {
    return (
      <div className="py-10">
        <div className="flex flex-col items-center py-24">
          <p className="text-sm" style={{ color: sub }}>Please login first to connect devices</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2" style={{ color: txt }}>
          <FiSmartphone className="inline mr-3" style={{ verticalAlign: "-4px" }} size={28} />
          Connect Mobile
        </h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: muted }}>
          Scan the QR code or open the link on your phone to sync your notes across devices
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* QR Code Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card p-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "rgba(124,58,237,0.1)" }}>
            <FiSmartphone size={24} style={{ color: "#7c3aed" }} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: txt }}>Scan QR Code</h3>
          <p className="text-xs text-center mb-6" style={{ color: sub }}>
            Open your phone camera and point it at this QR code
          </p>

          <div className="p-4 rounded-2xl mb-6"
            style={{ background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
            <QRCodeSVG
              value={connectURL}
              size={200}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="M"
              includeMargin={false}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "#10b981", animation: "pulse 2s infinite" }} />
            <span className="text-xs font-medium" style={{ color: "#10b981" }}>Ready to connect</span>
          </div>
        </motion.div>

        {/* Instructions Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card p-8">
          <h3 className="text-lg font-bold mb-6" style={{ color: txt }}>How to Connect</h3>

          <div className="space-y-5">
            {[
              {
                step: 1,
                icon: <FiSmartphone size={18} />,
                title: "Open on Phone",
                desc: "Scan the QR code with your phone camera, or copy the link below",
              },
              {
                step: 2,
                icon: <FiWifi size={18} />,
                title: "Auto Login",
                desc: "You'll be automatically logged in with the same account",
              },
              {
                step: 3,
                icon: <FiRefreshCw size={18} />,
                title: "Stay in Sync",
                desc: "Notes sync automatically across all your devices",
              },
              {
                step: 4,
                icon: <FiMonitor size={18} />,
                title: "Install as App",
                desc: "On mobile: Menu → Add to Home Screen for the best experience",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `rgba(124,58,237,${0.05 + s.step * 0.03})`, color: "#7c3aed" }}>
                  {s.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold mb-0.5" style={{ color: txt }}>
                    <span className="text-xs font-bold mr-2 px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed" }}>
                      {s.step}
                    </span>
                    {s.title}
                  </h4>
                  <p className="text-xs" style={{ color: sub }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Copy Link */}
          <div className="mt-8 p-4 rounded-xl"
            style={{ background: dark ? "rgba(51,65,85,0.2)" : "rgba(241,245,249,0.6)",
              border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}` }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: sub }}>Or copy link</p>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg text-xs truncate"
                style={{ background: dark ? "rgba(30,41,59,0.6)" : "#fff",
                  border: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
                  color: muted }}>
                {connectURL}
              </div>
              <button onClick={copyLink}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold cursor-pointer shrink-0"
                style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}>
                {copied ? <><FiCheck size={12} /> Copied!</> : <><FiCopy size={12} /> Copy</>}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tips */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="card p-6 mt-6 max-w-4xl mx-auto">
        <h3 className="text-sm font-bold mb-3" style={{ color: txt }}>Tips for Best Experience</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Install PWA", desc: "Add to Home Screen for native app experience with push notifications" },
            { title: "Enable Notifications", desc: "Allow notifications to receive reminders on your phone" },
            { title: "Same Network", desc: "For local development, ensure both devices are on the same WiFi network" },
          ].map((t) => (
            <div key={t.title} className="p-3 rounded-xl"
              style={{ background: dark ? "rgba(51,65,85,0.15)" : "rgba(241,245,249,0.5)" }}>
              <p className="text-xs font-bold mb-1" style={{ color: txt }}>{t.title}</p>
              <p className="text-xs" style={{ color: muted }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
