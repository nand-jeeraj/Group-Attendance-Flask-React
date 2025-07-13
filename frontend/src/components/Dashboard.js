import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/dashboard")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load dashboard", err));
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>Dashboard</h2>

        {data.length === 0 ? (
          <p>No data available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, idx) => (
                <tr key={idx}>
                  <td>{d._id}</td>
                  <td>{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
