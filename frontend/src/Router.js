import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./components/Login";
import Register from "./components/Register";
import UploadPage from "./components/UploadPage";
import History from "./components/History";
import Dashboard from "./components/Dashboard";
import AddFace from "./components/AddFace";
import api from "./services/api";
import { AuthContext } from "./Authcontext";

export default function Router() {
  const [authenticated, setAuthenticated] = useState(null);

  // ping backend on first load
  const checkAuth = () => {
    api.get("/check-auth")
      .then(() => {
        setAuthenticated(true);
        localStorage.setItem("authenticated", "true");
      })
      .catch(() => {
        setAuthenticated(false);
        localStorage.removeItem("authenticated");
      });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (authenticated === null) return <div>Loading…</div>;

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated, checkAuth }}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={authenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={authenticated ? <Navigate to="/" /> : <Register />}
        />

        {/* Protected routes */}
        {authenticated ? (
          <Route path="/" element={<App />}>
            <Route index element={<UploadPage />} />
            <Route path="history" element={<History />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="add-face" element={<AddFace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </AuthContext.Provider>
  );
}
