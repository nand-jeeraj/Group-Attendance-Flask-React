import React, { useContext } from "react";
import "./style.css";
import { Outlet, Link, useNavigate } from "react-router-dom";
import api from "./services/api";
import { AuthContext } from "./Authcontext";  

export default function App() {
  const navigate = useNavigate();
  const { setAuthenticated } = useContext(AuthContext);  

  const logout = async () => {
    try {
      await api.post("/logout");
      setAuthenticated(false);                   
      navigate("/login");                        
    } catch (err) {
      alert("Logout failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-200 p-4">
      <nav className="flex gap-4 mb-6">
        <Link to="/">Upload</Link>
        <Link to="/history">History</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/add-face">Add Face</Link>
        <button onClick={logout}>Logout</button>
      </nav>
      <Outlet />
    </div>
  );
}
