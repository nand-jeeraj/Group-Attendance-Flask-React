import React, { useState, useContext } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Authcontext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const { setAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", form);
      if (res.data.success) {
        setAuthenticated(true);             // update context
        navigate("/");                      // go to Upload page
      } else {
        alert("Invalid credentials");
      }
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <form className="container form-box" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        className="input-field"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        className="input-field"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button className="btn" type="submit">Login</button>

      <p style={{ marginTop: 10 }}>
        Don’t have an account? <a href="/register">Register here</a>
      </p>
    </form>
  );
}
