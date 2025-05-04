import React from "react";
import { useDisplaySettings } from "../context/DisplaySettingsContext";
import "./DisplaySettings.css";

const DisplaySettings: React.FC = () => {
  const {
    fontSize,
    theme,
    highContrast,
    primaryColor,
    setFontSize,
    setTheme,
    setHighContrast,
    setPrimaryColor,
  } = useDisplaySettings();

  return (
    <div className="display-settings-container">
      <h2>הגדרות תצוגה ונגישות</h2>

      <div className="setting">
        <label htmlFor="fontSize">גודל גופן: {fontSize}px</label>
        <input
          id="fontSize"
          type="range"
          min="12"
          max="24"
          step="1"
          value={fontSize}
          onChange={(e) => setFontSize(+e.target.value)}
        />
      </div>

      <div className="setting">
        <label>מצב לילה:</label>
        <button
          className={`toggle-btn ${theme === "dark" ? "active" : ""}`}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? "כבוי" : "פעיל"}
        </button>
      </div>

      <div className="setting">
        <label>ניגודיות גבוהה:</label>
        <button
          className={`toggle-btn ${highContrast ? "active" : ""}`}
          onClick={() => setHighContrast(!highContrast)}
        >
          {highContrast ? "פעיל" : "כבוי"}
        </button>
      </div>

      <div className="setting">
        <label htmlFor="primaryColor">צבע ראשי:</label>
        <input
          id="primaryColor"
          type="color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
        />
      </div>
    </div>
  );
};

export default DisplaySettings;
