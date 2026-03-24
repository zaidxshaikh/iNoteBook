import { FiPrinter } from "react-icons/fi";

export default function PrintNote({ note }) {
  const doPrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html><head>
        <title>${note.title} - iNotebook</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.8; }
          .header { border-bottom: 3px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
          .title { font-size: 28px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
          .meta { display: flex; gap: 16px; font-size: 13px; color: #64748b; }
          .tag { display: inline-block; padding: 2px 10px; border-radius: 4px; background: #f1f5f9; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .content { font-size: 15px; white-space: pre-wrap; color: #334155; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print { body { padding: 20px; } }
        </style>
      </head><body>
        <div class="header">
          <div class="title">${escapeHtml(note.title)}</div>
          <div class="meta">
            <span class="tag">${escapeHtml(note.tag || "General")}</span>
            <span>${new Date(note.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            <span>${note.description.trim().split(/\\s+/).filter(Boolean).length} words</span>
          </div>
        </div>
        <div class="content">${escapeHtml(note.description)}</div>
        <div class="footer">Printed from iNotebook</div>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  };

  return (
    <button onClick={doPrint} title="Print note"
      className="p-1.5 cursor-pointer hover:scale-110 transition-transform"
      style={{ border: "none", background: "transparent", borderRadius: 6, color: "inherit" }}>
      <FiPrinter size={14} />
    </button>
  );
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
