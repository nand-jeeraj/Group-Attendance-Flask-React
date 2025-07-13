import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function History() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get("/history")
      .then((res) => setRecords(res.data))
      .catch((err) => console.error("Failed to load history", err));
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>Attendance History</h2>

        {records.length === 0 ? (
          <p>No records found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.student_name}</td>
                  <td>{new Date(r.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
