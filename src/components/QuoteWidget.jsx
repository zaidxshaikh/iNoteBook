import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiRefreshCw } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
  { text: "Write it. Shoot it. Publish it. Crochet it. Sauté it. Whatever. MAKE.", author: "Joss Whedon" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Great things are not done by impulse, but by a series of small things brought together.", author: "Vincent van Gogh" },
  { text: "The pen is mightier than the sword.", author: "Edward Bulwer-Lytton" },
  { text: "Either write something worth reading or do something worth writing.", author: "Benjamin Franklin" },
  { text: "You can always edit a bad page. You can't edit a blank page.", author: "Jodi Picoult" },
  { text: "A word after a word after a word is power.", author: "Margaret Atwood" },
  { text: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou" },
  { text: "Fill your paper with the breathings of your heart.", author: "William Wordsworth" },
  { text: "If you want to change the world, pick up your pen and write.", author: "Martin Luther" },
  { text: "Ideas are like rabbits. You get a couple and learn how to handle them, and pretty soon you have a dozen.", author: "John Steinbeck" },
];

export default function QuoteWidget() {
  const { dark } = useTheme();
  const [idx, setIdx] = useState(() => {
    const day = Math.floor(Date.now() / 86400000);
    return day % quotes.length;
  });

  const q = quotes[idx];
  const sub = dark ? "#94a3b8" : "#64748b";

  const next = () => setIdx((i) => (i + 1) % quotes.length);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm italic leading-relaxed mb-2" style={{ color: dark ? "#e2e8f0" : "#334155" }}>
            &ldquo;{q.text}&rdquo;
          </p>
          <p className="text-xs font-semibold" style={{ color: "#7c3aed" }}>— {q.author}</p>
        </div>
        <button onClick={next} className="p-1.5 cursor-pointer shrink-0"
          style={{ border: "none", background: "transparent", color: sub }}>
          <FiRefreshCw size={14} />
        </button>
      </div>
    </motion.div>
  );
}
