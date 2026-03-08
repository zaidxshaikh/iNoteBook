import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import NoteState from "./context/notes/NoteState";
import Navbar from "./components/Navbar";
import Alert from "./components/Alert";
import Home from "./components/Home";
import About from "./components/About";
import Trash from "./components/Trash";
import Reminders from "./components/Reminders";
import ConnectDevice from "./components/ConnectDevice";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNotifications } from "./hooks/useNotifications";
import { useSync } from "./hooks/useSync";

function AnimatedRoutes({ showAlert, notifications }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrap><Home showAlert={showAlert} notifications={notifications} /></PageWrap>} />
        <Route path="/about" element={<PageWrap><About /></PageWrap>} />
        <Route path="/trash" element={<PageWrap><Trash showAlert={showAlert} /></PageWrap>} />
        <Route path="/reminders" element={<PageWrap><Reminders showAlert={showAlert} notifications={notifications} /></PageWrap>} />
        <Route path="/connect" element={<PageWrap><ConnectDevice showAlert={showAlert} /></PageWrap>} />
        <Route path="/login" element={<Login showAlert={showAlert} />} />
        <Route path="/signup" element={<Signup showAlert={showAlert} />} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrap({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

function Shell() {
  const { dark } = useTheme();
  const [alert, setAlert] = useState(null);
  const notifications = useNotifications();
  const sync = useSync();

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 2800);
  };

  return (
    <Router>
      <div className="min-h-screen relative" style={{ background: dark ? "#050810" : "#fafbff" }}>
        <div className="mesh-bg" />
        <div className="relative z-10">
          <ShellContent showAlert={showAlert} alert={alert} notifications={notifications} sync={sync} />
        </div>
      </div>
    </Router>
  );
}

function ShellContent({ showAlert, alert, notifications, sync }) {
  const location = useLocation();
  const isAuth = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      {!isAuth && <Navbar showAlert={showAlert} notifications={notifications} sync={sync} />}
      <Alert alert={alert} />
      {isAuth ? (
        <AnimatedRoutes showAlert={showAlert} notifications={notifications} />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <AnimatedRoutes showAlert={showAlert} notifications={notifications} />
        </main>
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NoteState>
        <Shell />
      </NoteState>
    </ThemeProvider>
  );
}
