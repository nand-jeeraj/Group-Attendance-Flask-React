import React, { useState } from "react";
import api from "../services/api";

export default function AddFace() {
  const [name, setName] = useState("");
  const [img, setImg] = useState(null);

  const submit = async () => {
    if (!name || !img) {
      alert("Please provide both a name and an image.");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("image", img);

    try {
      await api.post("/known-face", fd, {
        headers: { "Content-Type": "multipart/form-data" }, 
      });
      alert("Face added successfully!");
      setName("");
      setImg(null);
    } catch (err) {
      console.error("Error adding face:", err);
      alert("Failed to add face.");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Add Known Face</h2>

        <input
          className="input-field"
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input-field"
          type="file"
          accept="image/*"
          onChange={(e) => setImg(e.target.files[0])}
        />

        <button className="btn" onClick={submit}>Submit</button>
      </div>
    </div>
  );
}
