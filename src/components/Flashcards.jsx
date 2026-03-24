import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiRotateCw,
  FiChevronLeft,
  FiChevronRight,
  FiShuffle,
  FiCheck,
  FiRefreshCw,
  FiBookOpen,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import noteContext from "../context/notes/noteContext";

const STORAGE_KEY = "inotebook-flashcard-progress";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export default function Flashcards({ showAlert }) {
  const { dark } = useTheme();
  const { notes } = useContext(noteContext);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState(loadProgress);
  const [filterTag, setFilterTag] = useState("All");
  const [studyMode, setStudyMode] = useState("All");
  const [direction, setDirection] = useState(0);

  // Derive unique tags
  const tags = useMemo(() => {
    const set = new Set();
    (notes || []).forEach((n) => {
      if (n.tag) set.add(n.tag);
    });
    return ["All", ...Array.from(set).sort()];
  }, [notes]);

  // Filtered deck
  const deck = useMemo(() => {
    let filtered = (notes || []).filter((n) => n.title && n.description);
    if (filterTag !== "All") {
      filtered = filtered.filter((n) => n.tag === filterTag);
    }
    if (studyMode === "Review Only") {
      filtered = filtered.filter((n) => progress[n._id] === "review");
    }
    return filtered;
  }, [notes, filterTag, studyMode, progress]);

  // Stats
  const stats = useMemo(() => {
    const ids = (notes || []).map((n) => n._id);
    let reviewed = 0;
    let known = 0;
    ids.forEach((id) => {
      if (progress[id] === "known") {
        reviewed++;
        known++;
      } else if (progress[id] === "review") {
        reviewed++;
      }
    });
    const accuracy = reviewed > 0 ? Math.round((known / reviewed) * 100) : 0;
    return { reviewed, known, accuracy };
  }, [notes, progress]);

  // Keep index in bounds
  useEffect(() => {
    if (deck.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= deck.length) {
      setCurrentIndex(deck.length - 1);
    }
  }, [deck.length, currentIndex]);

  // Reset flip on card change
  useEffect(() => {
    setFlipped(false);
  }, [currentIndex]);

  // Keyboard support
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "ArrowLeft") {
        setDirection(-1);
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : deck.length - 1));
      } else if (e.key === "ArrowRight") {
        setDirection(1);
        setCurrentIndex((prev) => (prev < deck.length - 1 ? prev + 1 : 0));
      } else if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    },
    [deck.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const goPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : deck.length - 1));
  };

  const goNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev < deck.length - 1 ? prev + 1 : 0));
  };

  const shuffle = () => {
    if (deck.length < 2) return;
    let next;
    do {
      next = Math.floor(Math.random() * deck.length);
    } while (next === currentIndex);
    setDirection(1);
    setCurrentIndex(next);
  };

  const markCard = (status) => {
    if (deck.length === 0) return;
    const id = deck[currentIndex]._id;
    const updated = { ...progress, [id]: status };
    setProgress(updated);
    saveProgress(updated);
    if (showAlert) {
      showAlert(
        status === "known" ? "Marked as Known" : "Marked for Review",
        "success"
      );
    }
  };

  const currentCard = deck[currentIndex] || null;
  const progressPercent =
    deck.length > 0 ? ((currentIndex + 1) / deck.length) * 100 : 0;

  // Colors
  const bg = dark ? "#1e1b2e" : "#f5f3ff";
  const surface = dark ? "#2d2a3e" : "#ffffff";
  const text = dark ? "#e2e0f0" : "#1e1b2e";
  const textMuted = dark ? "#a09cb5" : "#6b7280";
  const primary = "#7c3aed";
  const primaryLight = dark ? "#6d28d9" : "#ede9fe";
  const borderColor = dark ? "#3d3a50" : "#e5e0f5";

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        color: text,
        padding: "24px 16px",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto 24px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <FiBookOpen size={28} color={primary} />
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            background: `linear-gradient(135deg, ${primary}, #a78bfa)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Flashcards
        </h1>
      </div>

      {/* Controls Row */}
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto 20px",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Tag Filter */}
        <select
          value={filterTag}
          onChange={(e) => {
            setFilterTag(e.target.value);
            setCurrentIndex(0);
          }}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: `1px solid ${borderColor}`,
            background: surface,
            color: text,
            fontSize: 14,
            outline: "none",
            cursor: "pointer",
          }}
        >
          {tags.map((t) => (
            <option key={t} value={t}>
              {t === "All" ? "All Tags" : t}
            </option>
          ))}
        </select>

        {/* Study Mode */}
        <select
          value={studyMode}
          onChange={(e) => {
            setStudyMode(e.target.value);
            setCurrentIndex(0);
          }}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: `1px solid ${borderColor}`,
            background: surface,
            color: text,
            fontSize: 14,
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="All">All Cards</option>
          <option value="Review Only">Review Only</option>
        </select>

        {/* Card Counter */}
        <span style={{ fontSize: 14, color: textMuted, marginLeft: "auto" }}>
          {deck.length > 0 ? `${currentIndex + 1} / ${deck.length}` : "0 / 0"}{" "}
          cards
        </span>
      </div>

      {/* Stats Row */}
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto 20px",
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Reviewed", value: stats.reviewed },
          { label: "Known", value: stats.known },
          { label: "Accuracy", value: `${stats.accuracy}%` },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: "1 1 120px",
              background: surface,
              border: `1px solid ${borderColor}`,
              borderRadius: 12,
              padding: "12px 16px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, color: primary }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto 28px",
          height: 6,
          borderRadius: 3,
          background: dark ? "#3d3a50" : "#e5e0f5",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${primary}, #a78bfa)`,
            borderRadius: 3,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Flashcard Area */}
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto 28px",
          minHeight: 340,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: 1200,
        }}
      >
        {deck.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: textMuted,
              padding: 40,
            }}
          >
            <FiBookOpen size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontSize: 18 }}>No flashcards available.</p>
            <p style={{ fontSize: 14 }}>
              {studyMode === "Review Only"
                ? "No cards marked for review. Switch to All Cards."
                : "Add some notes to start studying!"}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentCard._id + "-" + currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}
            >
              <div
                className="card"
                onClick={() => setFlipped((f) => !f)}
                style={{
                  width: "100%",
                  minHeight: 300,
                  cursor: "pointer",
                  perspective: 1200,
                }}
              >
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  style={{
                    width: "100%",
                    minHeight: 300,
                    position: "relative",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Front */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      borderRadius: 20,
                      padding: 3,
                      background: `linear-gradient(135deg, ${primary}, #a78bfa, #c084fc)`,
                    }}
                  >
                    <div
                      style={{
                        background: surface,
                        borderRadius: 18,
                        height: "100%",
                        minHeight: 294,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "32px 28px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 14,
                          left: 18,
                          fontSize: 11,
                          fontWeight: 600,
                          color: primary,
                          textTransform: "uppercase",
                          letterSpacing: 1.2,
                        }}
                      >
                        Front
                      </div>
                      {currentCard.tag && (
                        <div
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 16,
                            fontSize: 11,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: primaryLight,
                            color: primary,
                            fontWeight: 600,
                          }}
                        >
                          {currentCard.tag}
                        </div>
                      )}
                      <h2
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          textAlign: "center",
                          color: text,
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {currentCard.title}
                      </h2>
                      <p
                        style={{
                          fontSize: 13,
                          color: textMuted,
                          marginTop: 16,
                        }}
                      >
                        Click or press Space to flip
                      </p>
                      {progress[currentCard._id] && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: 14,
                            right: 18,
                            fontSize: 11,
                            padding: "3px 10px",
                            borderRadius: 20,
                            background:
                              progress[currentCard._id] === "known"
                                ? dark
                                  ? "#064e3b"
                                  : "#d1fae5"
                                : dark
                                ? "#7c2d12"
                                : "#fed7aa",
                            color:
                              progress[currentCard._id] === "known"
                                ? "#10b981"
                                : "#f97316",
                            fontWeight: 600,
                          }}
                        >
                          {progress[currentCard._id] === "known"
                            ? "Known"
                            : "Review"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      borderRadius: 20,
                      padding: 3,
                      background: `linear-gradient(135deg, #a78bfa, ${primary}, #6d28d9)`,
                    }}
                  >
                    <div
                      style={{
                        background: surface,
                        borderRadius: 18,
                        height: "100%",
                        minHeight: 294,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "32px 28px",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 14,
                          left: 18,
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#a78bfa",
                          textTransform: "uppercase",
                          letterSpacing: 1.2,
                        }}
                      >
                        Back
                      </div>
                      <p
                        style={{
                          fontSize: 18,
                          textAlign: "center",
                          color: text,
                          margin: 0,
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {currentCard.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Navigation & Action Buttons */}
      {deck.length > 0 && (
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
            }}
          >
            <button
              onClick={goPrev}
              title="Previous (Left Arrow)"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                border: `1px solid ${borderColor}`,
                background: surface,
                color: text,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                transition: "all 0.2s",
              }}
            >
              <FiChevronLeft />
            </button>

            <button
              onClick={() => setFlipped((f) => !f)}
              title="Flip (Space)"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                border: `1px solid ${borderColor}`,
                background: surface,
                color: primary,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                transition: "all 0.2s",
              }}
            >
              <FiRotateCw />
            </button>

            <button
              onClick={shuffle}
              title="Shuffle"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                border: `1px solid ${borderColor}`,
                background: surface,
                color: text,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                transition: "all 0.2s",
              }}
            >
              <FiShuffle />
            </button>

            <button
              onClick={goNext}
              title="Next (Right Arrow)"
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                border: `1px solid ${borderColor}`,
                background: surface,
                color: text,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                transition: "all 0.2s",
              }}
            >
              <FiChevronRight />
            </button>
          </div>

          {/* Known / Review Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 14,
            }}
          >
            <button
              onClick={() => markCard("known")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                borderRadius: 12,
                border: "none",
                background: dark
                  ? "linear-gradient(135deg, #064e3b, #065f46)"
                  : "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                color: dark ? "#34d399" : "#047857",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <FiCheck size={18} />
              Known
            </button>

            <button
              onClick={() => markCard("review")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 24px",
                borderRadius: 12,
                border: "none",
                background: dark
                  ? "linear-gradient(135deg, #7c2d12, #9a3412)"
                  : "linear-gradient(135deg, #fed7aa, #fdba74)",
                color: dark ? "#fb923c" : "#c2410c",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <FiRefreshCw size={18} />
              Review
            </button>
          </div>

          {/* Keyboard Hints */}
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: textMuted,
              margin: 0,
            }}
          >
            Keyboard: &larr; / &rarr; navigate &middot; Space flip
          </p>
        </div>
      )}
    </div>
  );
}
