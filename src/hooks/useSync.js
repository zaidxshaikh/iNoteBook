import { useState, useEffect, useCallback } from "react";

export function useSync() {
  const [status, setStatus] = useState("synced"); // synced | syncing | offline | error
  const [lastSync, setLastSync] = useState(Date.now());
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => { setOnline(true); setStatus("synced"); };
    const off = () => { setOnline(false); setStatus("offline"); };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const markSyncing = useCallback(() => setStatus("syncing"), []);
  const markSynced = useCallback(() => { setStatus("synced"); setLastSync(Date.now()); }, []);
  const markError = useCallback(() => setStatus("error"), []);

  const timeSinceSync = () => {
    const ms = Date.now() - lastSync;
    const s = Math.floor(ms / 1000);
    if (s < 10) return "Just now";
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  };

  return { status, online, lastSync, markSyncing, markSynced, markError, timeSinceSync };
}

// Generate a connection token for QR code
export function generateConnectToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const host = window.location.origin;
  return JSON.stringify({ host, token, ts: Date.now() });
}

// Build the URL for QR scanning
export function getConnectURL() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const host = window.location.origin;
  return `${host}/login?auto=${encodeURIComponent(token)}`;
}
