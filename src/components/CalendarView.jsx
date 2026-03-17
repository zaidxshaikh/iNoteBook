import { useContext, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiX, FiFileText } from "react-icons/fi";
import noteContext from "../context/notes/noteContext";
import { useTheme } from "../context/ThemeContext";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateKey(d) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function CalendarView({ showAlert }) {
  const { notes } = useContext(noteContext);
  const { dark } = useTheme();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [direction, setDirection] = useState(0);

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";
  const cardBg = dark ? "rgba(30,41,59,0.5)" : "rgba(255,255,255,0.7)";
  const cellBg = dark ? "rgba(51,65,85,0.25)" : "rgba(241,245,249,0.5)";
  const cellHover = dark ? "rgba(51,65,85,0.5)" : "rgba(241,245,249,0.9)";
  const border = dark ? "rgba(51,65,85,0.4)" : "rgba(226,232,240,0.6)";
  const primary = "#7c3aed";

  // Index notes by date
  const notesByDate = useMemo(() => {
    const map = {};
    if (!notes) return map;
    notes.forEach((note) => {
      const d = new Date(note.date);
      const key = dateKey(d);
      if (!map[key]) map[key] = [];
      map[key].push(note);
    });
    return map;
  }, [notes]);

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const prevMonthDays = getDaysInMonth(
      currentMonth === 0 ? currentYear - 1 : currentYear,
      currentMonth === 0 ? 11 : currentMonth - 1
    );

    const cells = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push({ day, month: m, year: y, outside: true });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: currentMonth, year: currentYear, outside: false });
    }

    // Next month leading days
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push({ day: d, month: m, year: y, outside: true });
    }

    return cells;
  }, [currentMonth, currentYear]);

  const goToPrevMonth = useCallback(() => {
    setDirection(-1);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    setDirection(1);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    const t = new Date();
    setDirection(
      t.getFullYear() * 12 + t.getMonth() > currentYear * 12 + currentMonth ? 1 : -1
    );
    setCurrentMonth(t.getMonth());
    setCurrentYear(t.getFullYear());
  }, [currentMonth, currentYear]);

  const handleDayClick = (cell) => {
    const d = new Date(cell.year, cell.month, cell.day);
    setSelectedDate(d);
  };

  const selectedNotes = useMemo(() => {
    if (!selectedDate) return [];
    const key = dateKey(selectedDate);
    return notesByDate[key] || [];
  }, [selectedDate, notesByDate]);

  const totalNotesThisMonth = useMemo(() => {
    let count = 0;
    if (!notes) return 0;
    notes.forEach((note) => {
      const d = new Date(note.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) count++;
    });
    return count;
  }, [notes, currentMonth, currentYear]);

  const dotColors = ["#7c3aed", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"];

  const gridVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: txt }}>
              <FiCalendar
                className="inline mr-3"
                style={{ verticalAlign: "-4px" }}
                size={28}
              />
              Calendar
            </h1>
            <p className="text-sm" style={{ color: muted }}>
              {totalNotesThisMonth} note{totalNotesThisMonth !== 1 ? "s" : ""} in{" "}
              {MONTHS[currentMonth]} {currentYear}
            </p>
          </div>
        </div>
      </motion.div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: selectedDate ? "1fr 380px" : "1fr",
          gap: 24,
          alignItems: "start",
          transition: "grid-template-columns 0.3s ease",
        }}
        className="calendar-layout"
      >
        {/* Calendar Card */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ padding: 0, overflow: "hidden" }}
        >
          {/* Month Navigation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px 16px",
              borderBottom: `1px solid ${border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={goToPrevMonth}
                style={{
                  background: cellBg,
                  border: `1px solid ${border}`,
                  borderRadius: 10,
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: txt,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = cellHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = cellBg)}
              >
                <FiChevronLeft size={18} />
              </button>
              <button
                onClick={goToNextMonth}
                style={{
                  background: cellBg,
                  border: `1px solid ${border}`,
                  borderRadius: 10,
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: txt,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = cellHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = cellBg)}
              >
                <FiChevronRight size={18} />
              </button>
            </div>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: txt,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {MONTHS[currentMonth]} {currentYear}
            </h2>

            <button
              onClick={goToToday}
              style={{
                background: primary,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(124,58,237,0.3)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              Today
            </button>
          </div>

          {/* Day Headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              padding: "12px 16px 4px",
              gap: 4,
            }}
          >
            {DAYS.map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  color: muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "4px 0",
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{ padding: "4px 16px 16px", position: "relative", minHeight: 340 }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${currentYear}-${currentMonth}`}
                custom={direction}
                variants={gridVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 4,
                }}
              >
                {calendarGrid.map((cell, idx) => {
                  const cellDate = new Date(cell.year, cell.month, cell.day);
                  const key = dateKey(cellDate);
                  const cellNotes = notesByDate[key] || [];
                  const isToday = isSameDay(cellDate, today);
                  const isSelected =
                    selectedDate && isSameDay(cellDate, selectedDate);

                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDayClick(cell)}
                      style={{
                        position: "relative",
                        aspectRatio: "1",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                        borderRadius: 12,
                        border: isSelected
                          ? `2px solid ${primary}`
                          : isToday
                          ? `2px solid ${primary}40`
                          : `1px solid transparent`,
                        background: isSelected
                          ? `${primary}18`
                          : isToday
                          ? dark
                            ? "rgba(124,58,237,0.08)"
                            : "rgba(124,58,237,0.05)"
                          : "transparent",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        padding: 2,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = cellHover;
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = isToday
                            ? dark
                              ? "rgba(124,58,237,0.08)"
                              : "rgba(124,58,237,0.05)"
                            : "transparent";
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: isToday ? 700 : cell.outside ? 400 : 500,
                          color: isSelected
                            ? primary
                            : isToday
                            ? primary
                            : cell.outside
                            ? muted
                            : txt,
                          opacity: cell.outside ? 0.5 : 1,
                          lineHeight: 1,
                        }}
                      >
                        {cell.day}
                      </span>

                      {/* Note dots */}
                      {cellNotes.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: 2,
                            alignItems: "center",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            maxWidth: "100%",
                          }}
                        >
                          {cellNotes.length <= 3 ? (
                            cellNotes.map((n, i) => (
                              <span
                                key={n._id}
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: "50%",
                                  background:
                                    n.color || dotColors[i % dotColors.length],
                                  flexShrink: 0,
                                }}
                              />
                            ))
                          ) : (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: primary,
                                lineHeight: 1,
                              }}
                            >
                              {cellNotes.length}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Sidebar - Notes for selected date */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              className="card calendar-sidebar"
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ padding: 0, overflow: "hidden" }}
            >
              {/* Sidebar Header */}
              <div
                style={{
                  padding: "20px 20px 16px",
                  borderBottom: `1px solid ${border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: txt,
                      margin: 0,
                    }}
                  >
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: muted,
                      margin: "4px 0 0",
                    }}
                  >
                    {selectedNotes.length} note
                    {selectedNotes.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDate(null)}
                  style={{
                    background: cellBg,
                    border: `1px solid ${border}`,
                    borderRadius: 8,
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: sub,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = cellHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = cellBg)
                  }
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* Sidebar Notes List */}
              <div
                style={{
                  padding: 16,
                  maxHeight: 420,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {selectedNotes.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                    }}
                  >
                    <FiFileText
                      size={36}
                      style={{ color: muted, marginBottom: 12 }}
                    />
                    <p
                      style={{
                        fontSize: 14,
                        color: sub,
                        margin: 0,
                        fontWeight: 500,
                      }}
                    >
                      No notes on this day
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: muted,
                        margin: "6px 0 0",
                      }}
                    >
                      Notes you create will appear here
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {selectedNotes.map((note, i) => (
                      <motion.div
                        key={note._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          padding: "14px 16px",
                          borderRadius: 12,
                          background: cellBg,
                          border: `1px solid ${border}`,
                          borderLeft: `3px solid ${note.color || primary}`,
                          transition: "all 0.2s",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = cellHover)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = cellBg)
                        }
                      >
                        <h4
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: txt,
                            margin: 0,
                            lineHeight: 1.4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {note.title}
                        </h4>
                        {note.description && (
                          <p
                            style={{
                              fontSize: 12,
                              color: sub,
                              margin: "6px 0 0",
                              lineHeight: 1.5,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {note.description}
                          </p>
                        )}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 8,
                          }}
                        >
                          {note.tag && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: primary,
                                background: `${primary}15`,
                                padding: "3px 8px",
                                borderRadius: 6,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                              }}
                            >
                              {note.tag}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: 10,
                              color: muted,
                            }}
                          >
                            {new Date(note.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Responsive / Mobile styles injected inline */}
      <style>{`
        @media (max-width: 768px) {
          .calendar-layout {
            grid-template-columns: 1fr !important;
          }
          .calendar-sidebar {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 50 !important;
            border-radius: 20px 20px 0 0 !important;
            max-height: 55vh !important;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.2) !important;
          }
        }
      `}</style>
    </div>
  );
}
