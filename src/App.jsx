import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import Navbar from "./components/Navbar";
import NoteState from "./context/notes/NoteState";
import { ThemeProvider } from "./context/ThemeContext";
import Alert from "./components/Alert";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { useState } from "react";

function App() {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type) => {
    setAlert({ msg: message, type: type });
    setTimeout(() => {
      setAlert(null);
    }, 2500);
  };

  return (
    <ThemeProvider>
      <NoteState>
        <Router>
          <div className="min-h-screen transition-colors duration-300">
            <Navbar showAlert={showAlert} />
            <Alert alert={alert} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <Routes>
                <Route path="/" element={<Home showAlert={showAlert} />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login showAlert={showAlert} />} />
                <Route path="/signup" element={<Signup showAlert={showAlert} />} />
              </Routes>
            </main>
          </div>
        </Router>
      </NoteState>
    </ThemeProvider>
  );
}

export default App;
