import { useState, useEffect, useCallback } from "react";

const REMINDERS_KEY = "inotebook-reminders";

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );
  const [reminders, setReminders] = useState(() => {
    const s = localStorage.getItem(REMINDERS_KEY);
    return s ? JSON.parse(s) : [];
  });
  const [swReady, setSwReady] = useState(false);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        setSwReady(true);
        console.log("SW registered");
      }).catch((err) => {
        console.log("SW registration failed:", err);
      });
    }
  }, []);

  // Check and fire due reminders every 30 seconds
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const due = reminders.filter((r) => new Date(r.remindAt).getTime() <= now && !r.fired);
      if (due.length > 0) {
        due.forEach((r) => {
          fireNotification(r.title, r.description);
          r.fired = true;
        });
        const updated = reminders.map((r) => {
          const d = due.find((d) => d.id === r.id);
          return d ? { ...r, fired: true } : r;
        });
        setReminders(updated);
        localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
      }
    };

    const interval = setInterval(check, 30000);
    check(); // check immediately
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders]);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "denied";
    const perm = await Notification.requestPermission();
    setPermission(perm);
    return perm;
  }, []);

  const fireNotification = useCallback((title, body) => {
    if (permission !== "granted") return;

    // Try service worker notification first (works in background)
    if (swReady && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification("iNotebook Reminder", {
          body: `${title}: ${body.slice(0, 120)}`,
          icon: "/icon-192.svg",
          badge: "/icon-192.svg",
          tag: `reminder-${Date.now()}`,
          vibrate: [200, 100, 200],
          requireInteraction: true,
        });
      });
    } else {
      // Fallback to basic notification
      new Notification("iNotebook Reminder", {
        body: `${title}: ${body.slice(0, 120)}`,
        icon: "/icon-192.svg",
      });
    }
  }, [permission, swReady]);

  const addReminder = useCallback((noteId, title, description, remindAt) => {
    const reminder = {
      id: "rem-" + Date.now(),
      noteId,
      title,
      description,
      remindAt,
      createdAt: new Date().toISOString(),
      fired: false,
    };

    const updated = [reminder, ...reminders];
    setReminders(updated);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));

    // Also schedule via service worker for background notifications
    if (swReady && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SCHEDULE_REMINDER",
        id: reminder.id,
        title,
        description,
        remindAt,
      });
    }

    return reminder;
  }, [reminders, swReady]);

  const removeReminder = useCallback((id) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
  }, [reminders]);

  const clearFired = useCallback(() => {
    const updated = reminders.filter((r) => !r.fired);
    setReminders(updated);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
  }, [reminders]);

  const getRemindersForNote = useCallback((noteId) => {
    return reminders.filter((r) => r.noteId === noteId && !r.fired);
  }, [reminders]);

  const upcomingReminders = reminders
    .filter((r) => !r.fired)
    .sort((a, b) => new Date(a.remindAt) - new Date(b.remindAt));

  return {
    permission,
    requestPermission,
    addReminder,
    removeReminder,
    clearFired,
    getRemindersForNote,
    upcomingReminders,
    reminders,
  };
}
