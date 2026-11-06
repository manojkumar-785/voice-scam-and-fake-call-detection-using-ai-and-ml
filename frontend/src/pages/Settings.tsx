import { useState, useEffect } from "react";

function Settings() {

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") !== "false"
  );

  const [sensitivity, setSensitivity] = useState(
    Number(localStorage.getItem("sensitivity")) || 70
  );

  // Apply saved theme when page loads
  useEffect(() => {

    document.body.classList.toggle(
      "dark-mode",
      darkMode
    );

  }, []);

  const toggleDarkMode = () => {

    const newValue = !darkMode;

    setDarkMode(newValue);

    localStorage.setItem(
      "darkMode",
      String(newValue)
    );

    document.body.classList.toggle(
      "dark-mode",
      newValue
    );

  };

  const toggleNotifications = () => {

    const newValue = !notifications;

    setNotifications(newValue);

    localStorage.setItem(
      "notifications",
      String(newValue)
    );

  };

  const changeSensitivity = (
    value: number
  ) => {

    setSensitivity(value);

    localStorage.setItem(
      "sensitivity",
      String(value)
    );

  };

  const clearHistory = () => {

    const confirmDelete = window.confirm(
      "Delete all call history?"
    );

    if (!confirmDelete) return;

    localStorage.removeItem("callHistory");

    alert("History Cleared Successfully.");

    window.location.reload();

  };

  return (

    <div className="dashboard-container">

      <h1 className="dashboard-title">
        ⚙ Settings
      </h1>

      {/* Appearance */}

      <div className="chart-card">

        <h2>🌙 Appearance</h2>

        <label className="settings-item">

          <span>Dark Mode</span>

          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleDarkMode}
          />

        </label>

      </div>

      <br />

      {/* Notifications */}

      <div className="chart-card">

        <h2>🔔 Notifications</h2>

        <label className="settings-item">

          <span>Enable Alerts</span>

          <input
            type="checkbox"
            checked={notifications}
            onChange={toggleNotifications}
          />

        </label>

      </div>

      <br />

      {/* AI Sensitivity */}

      <div className="chart-card">

        <h2>🤖 AI Detection</h2>

        <p>

          Detection Sensitivity :

          <strong>

            {" "}

            {sensitivity}%

          </strong>

        </p>

        <input
          type="range"
          min="50"
          max="100"
          value={sensitivity}
          onChange={(e) =>
            changeSensitivity(
              Number(e.target.value)
            )
          }
          style={{
            width: "100%",
          }}
        />

      </div>

      <br />

      {/* Data */}

      <div className="chart-card">

        <h2>🗑 Data</h2>

        <button
          className="analyze-btn"
          onClick={clearHistory}
          style={{
            background: "#ef4444",
          }}
        >
          Clear Call History
        </button>

      </div>

      <br />

      {/* About */}

      <div className="chart-card">

        <h2>ℹ About</h2>

        <p>

          <strong>

            Voice Scam Detection AI

          </strong>

        </p>

        <p>Version : 1.0</p>

        <p>Frontend : React + TypeScript</p>

        <p>Backend : Flask + Python</p>

        <p>AI Model : Machine Learning + NLP</p>

        <p>
          Supports MP3, WAV, M4A, AAC,
          WEBM, OGG and FLAC audio files.
        </p>

      </div>

    </div>

  );

}

export default Settings;