import NoteContext from "./noteContext";
import { useState, useCallback } from "react";

const NoteState = (props) => {
  const host = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const getNotes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${host}/api/notes/fetchallnotes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      if (!response.ok) throw new Error("Failed to fetch notes");
      const json = await response.json();
      setNotes(json);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }, [host]);

  const addNote = async (title, description, tag) => {
    try {
      const response = await fetch(`${host}/api/notes/addnote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ title, description, tag }),
      });
      if (!response.ok) throw new Error("Failed to add note");
      const note = await response.json();
      setNotes((prev) => [note, ...prev]);
      return true;
    } catch (error) {
      console.error("Error adding note:", error);
      return false;
    }
  };

  const deleteNote = async (id) => {
    try {
      const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
      if (!response.ok) throw new Error("Failed to delete note");
      setNotes((prev) => prev.filter((note) => note._id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting note:", error);
      return false;
    }
  };

  const editNote = async (id, title, description, tag) => {
    try {
      const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({ title, description, tag }),
      });
      if (!response.ok) throw new Error("Failed to update note");
      const updatedNote = await response.json();
      setNotes((prev) =>
        prev.map((note) => (note._id === id ? updatedNote : note))
      );
      return true;
    } catch (error) {
      console.error("Error editing note:", error);
      return false;
    }
  };

  return (
    <NoteContext.Provider
      value={{ notes, addNote, deleteNote, editNote, getNotes, loading }}
    >
      {props.children}
    </NoteContext.Provider>
  );
};

export default NoteState;
