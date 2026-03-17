import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEdit3, FiTrash2, FiDownload, FiX, FiMinus, FiCircle } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const COLORS = ["#0f172a", "#7c3aed", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#fff"];
const SIZES = [2, 4, 8, 14, 24];

export default function DrawingPad({ onSave, onClose }) {
  const { dark } = useTheme();
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState(dark ? "#fff" : "#0f172a");
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState("pen"); // pen, eraser
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);
    ctx.fillStyle = dark ? "#0f172a" : "#ffffff";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  }, [dark]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? (dark ? "#0f172a" : "#ffffff") : color;
    ctx.lineWidth = tool === "eraser" ? size * 3 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();

    lastPos.current = pos;
  };

  const stopDraw = () => {
    setDrawing(false);
    lastPos.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = dark ? "#0f172a" : "#ffffff";
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  };

  const save = () => {
    const data = canvasRef.current.toDataURL("image/png");
    if (onSave) onSave(data);
  };

  const download = () => {
    const link = document.createElement("a");
    link.download = `sketch-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const muted = dark ? "#64748b" : "#94a3b8";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: dark ? "#050810" : "#fafbff" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 flex-wrap gap-2"
        style={{ borderBottom: `1px solid ${dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}` }}>
        <div className="flex items-center gap-2">
          <FiEdit3 size={18} style={{ color: "#7c3aed" }} />
          <span className="text-sm font-bold" style={{ color: txt }}>Sketch Pad</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Colors */}
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button key={c} onClick={() => { setColor(c); setTool("pen"); }}
                className="cursor-pointer"
                style={{
                  width: 22, height: 22, borderRadius: 6, background: c, border: "none",
                  outline: color === c && tool === "pen" ? `2px solid ${c === "#fff" ? "#7c3aed" : c}` : "none",
                  outlineOffset: 2,
                  boxShadow: c === "#fff" ? "inset 0 0 0 1px rgba(0,0,0,0.1)" : "none",
                }} />
            ))}
          </div>

          {/* Sizes */}
          <div className="flex items-center gap-1 ml-2">
            {SIZES.map((s) => (
              <button key={s} onClick={() => setSize(s)}
                className="flex items-center justify-center cursor-pointer"
                style={{
                  width: 28, height: 28, borderRadius: 6, border: "none",
                  background: size === s ? "rgba(124,58,237,0.1)" : "transparent",
                }}>
                <span style={{
                  width: Math.min(s + 2, 16), height: Math.min(s + 2, 16),
                  borderRadius: "50%", background: size === s ? "#7c3aed" : muted, display: "block",
                }} />
              </button>
            ))}
          </div>

          {/* Eraser */}
          <button onClick={() => setTool(tool === "eraser" ? "pen" : "eraser")}
            className="px-3 py-1.5 text-xs font-semibold cursor-pointer"
            style={{
              background: tool === "eraser" ? "rgba(239,68,68,0.1)" : "transparent",
              color: tool === "eraser" ? "#ef4444" : sub,
              border: `1px solid ${tool === "eraser" ? "rgba(239,68,68,0.3)" : dark ? "rgba(51,65,85,0.3)" : "rgba(226,232,240,0.5)"}`,
              borderRadius: 8,
            }}>
            Eraser
          </button>

          <button onClick={clear} title="Clear" className="p-2 cursor-pointer"
            style={{ border: "none", background: "transparent", color: muted }}>
            <FiTrash2 size={16} />
          </button>
          <button onClick={download} title="Download" className="p-2 cursor-pointer"
            style={{ border: "none", background: "transparent", color: muted }}>
            <FiDownload size={16} />
          </button>
          <button onClick={save}
            className="px-3 py-1.5 text-xs font-semibold cursor-pointer"
            style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8,
              boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}>
            Save to Note
          </button>
          <button onClick={onClose} className="p-2 cursor-pointer"
            style={{ border: "none", background: "transparent", color: muted }}>
            <FiX size={18} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
          style={{
            width: "100%", height: "100%", cursor: tool === "eraser" ? "cell" : "crosshair",
            touchAction: "none",
          }} />
      </div>
    </motion.div>
  );
}
