import React, { useEffect, useState } from "react";
import "./Home.css";

function Stats() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("short_links");
    if (stored) {
      setStats(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="App">
      <h2>Link Statistics</h2>
      {stats.length === 0 ? (
        <p>No links generated in this session.</p>
      ) : (
        <table className="stats_table">
          <thead>
            <tr>
              <th>#</th>
              <th>Short Link</th>
              <th>Created</th>
              <th>Expiry</th>
              <th>Clicks</th>
              <th>Origin</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td><a href={s.link} target="_blank" rel="noreferrer">{s.link}</a></td>
                <td>{new Date(s.created_at).toLocaleString()}</td>
                <td>{s.expiry || "N/A"}</td>
                <td>{s.clicks ?? "0"}</td>
                <td>{s.origin || "Unknown"}</td>
                <td>{s.location || "Unknown"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Stats;
