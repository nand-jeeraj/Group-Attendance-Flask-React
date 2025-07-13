import React, { useState } from "react";
import api from "../services/api";

export default function UploadPage() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);

  const submit = async () => {
    if (!image) {
      alert("Please select an image.");
      return;
    }

    const fd = new FormData();
    fd.append("image", image);

    try {
      const res = await api.post("/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Upload Group Photo</h2>

        <input
          type="file"
          className="input-field"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button className="btn" onClick={submit}>Upload</button>

        {result && (
          <div style={{ marginTop: "20px" }}>
            <p><strong>Total Faces Detected:</strong> {result.total}</p>
            <p><strong>Unknown Faces:</strong> {result.unknown}</p>

            <h3>Present Students:</h3>
            <ul>
              {result.present.length === 0
                ? <li style={{ marginInlineStart: "-39px" }}>No known faces found</li>
                : result.present.map((name, idx) => <li key={idx}>{name}</li>)
              }
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
