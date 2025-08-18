import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Profile Page (Coming Soon)</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <div className="developer-credit">
        Developed by:
        <a
          href="https://x.com/ciriyeck_goody"
          target="_blank"
          rel="noopener noreferrer"
        >
          Goodyyy
        </a>
      </div>
    </div>
  );
}

export default App;
