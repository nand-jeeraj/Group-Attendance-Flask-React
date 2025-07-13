import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/register", form);
      navigate("/login");      // redirect to login after successful signup
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <form className="container form-box" onSubmit={handleSubmit}>
      <h2>Register</h2>

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

      <button className="btn" type="submit">Register</button>

      {/* ⇢ Login link for existing users */}
      <p style={{ marginTop: "10px" }}>
        Already have an account?{" "}
        <a href="/login">Login here</a>
      </p>
    </form>
  );
}
