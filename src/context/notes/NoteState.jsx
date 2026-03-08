import NoteContext from "./noteContext";
import { useState, useCallback } from "react";

const DEMO_TOKEN = "demo-token-inotebook";
const DEMO_KEY = "demo-notes";
const TRASH_KEY = "demo-trash";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const defaultDemo = () => [
  {
    _id: "d1",
    title: "Welcome to iNotebook!",
    description:
      "This is your personal cloud notebook. Create, edit and organize notes with tags. Try adding one above!",
    tag: "General",
    color: "#7c3aed",
    date: new Date().toISOString(),
  },
  {
    _id: "d2",
    title: "Quick Tips",
    description:
      "Use Ctrl+N to quickly focus the new note form.\nPin important notes with the star icon.\nFilter notes by tags or search by keywords.\nPress ? to see all keyboard shortcuts.",
    tag: "Important",
    color: "#ef4444",
    date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "d3",
    title: "Dark Mode Available",
    description:
      "Toggle between light and dark mode using the theme button in the navbar. Your preference is saved automatically.",
    tag: "Personal",
    color: "#3b82f6",
    date: new Date(Date.now() - 7200000).toISOString(),
  },
];

const isDemo = () => localStorage.getItem("token") === DEMO_TOKEN;
const loadDemo = () => {
  const s = localStorage.getItem(DEMO_KEY);
  return s ? JSON.parse(s) : defaultDemo();
};
const saveDemo = (n) => localStorage.setItem(DEMO_KEY, JSON.stringify(n));
const loadTrash = () => {
  const s = localStorage.getItem(TRASH_KEY);
  return s ? JSON.parse(s) : [];
};
const saveTrash = (n) => localStorage.setItem(TRASH_KEY, JSON.stringify(n));
const headers = () => ({
  "Content-Type": "application/json",
  "auth-token": localStorage.getItem("token"),
});

const NoteState = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(false);

  const getNotes = useCallback(async () => {
    setLoading(true);
    try {
      if (isDemo()) {
        setNotes(loadDemo());
        setTrash(loadTrash());
        return;
      }
      const r = await fetch(`${API}/api/notes/fetchallnotes`, { headers: headers() });
      if (!r.ok) throw new Error();
      setNotes(await r.json());
    } catch (e) {
      console.error("Fetch notes error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNote = async (title, description, tag, color) => {
    try {
      if (isDemo()) {
        const n = {
          _id: "d" + Date.now(),
          title,
          description,
          tag: tag || "General",
          color: color || "#7c3aed",
          date: new Date().toISOString(),
        };
        setNotes((p) => {
          const u = [n, ...p];
          saveDemo(u);
          return u;
        });
        return true;
      }
      const r = await fetch(`${API}/api/notes/addnote`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ title, description, tag }),
      });
      if (!r.ok) throw new Error();
      const note = await r.json();
      setNotes((p) => [note, ...p]);
      return true;
    } catch {
      return false;
    }
  };

  const deleteNote = async (id) => {
    try {
      if (isDemo()) {
        let deleted = null;
        setNotes((p) => {
          deleted = p.find((n) => n._id === id);
          const u = p.filter((n) => n._id !== id);
          saveDemo(u);
          return u;
        });
        // Move to trash
        if (deleted) {
          setTrash((p) => {
            const u = [{ ...deleted, deletedAt: new Date().toISOString() }, ...p].slice(0, 50);
            saveTrash(u);
            return u;
          });
        }
        return true;
      }
      const r = await fetch(`${API}/api/notes/deletenote/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      if (!r.ok) throw new Error();
      setNotes((p) => p.filter((n) => n._id !== id));
      return true;
    } catch {
      return false;
    }
  };

  const editNote = async (id, title, description, tag, color) => {
    try {
      if (isDemo()) {
        setNotes((p) => {
          const u = p.map((n) =>
            n._id === id
              ? { ...n, title, description, tag, color: color || n.color, date: new Date().toISOString() }
              : n
          );
          saveDemo(u);
          return u;
        });
        return true;
      }
      const r = await fetch(`${API}/api/notes/updatenote/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ title, description, tag }),
      });
      if (!r.ok) throw new Error();
      const updated = await r.json();
      setNotes((p) => p.map((n) => (n._id === id ? updated : n)));
      return true;
    } catch {
      return false;
    }
  };

  const duplicateNote = async (note) => {
    return addNote(
      note.title + " (copy)",
      note.description,
      note.tag,
      note.color
    );
  };

  const restoreNote = (id) => {
    const note = trash.find((n) => n._id === id);
    if (!note) return false;
    const { deletedAt, ...restored } = note;
    restored._id = "d" + Date.now();
    setNotes((p) => {
      const u = [restored, ...p];
      saveDemo(u);
      return u;
    });
    setTrash((p) => {
      const u = p.filter((n) => n._id !== id);
      saveTrash(u);
      return u;
    });
    return true;
  };

  const emptyTrash = () => {
    setTrash([]);
    saveTrash([]);
  };

  const bulkDelete = async (ids) => {
    for (const id of ids) {
      await deleteNote(id);
    }
    return true;
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        trash,
        loading,
        getNotes,
        addNote,
        deleteNote,
        editNote,
        duplicateNote,
        restoreNote,
        emptyTrash,
        bulkDelete,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
};

export default NoteState;
