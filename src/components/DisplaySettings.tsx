import React from "react";
import { useDisplaySettings } from "../context/DisplaySettingsContext";
import "./DisplaySettings.css";

const DisplaySettings: React.FC = () => {
  const {
    fontSize,
    lineHeight,
    formulaFontSize,
    highContrast,
    primaryColor,
    setFontSize,
    setLineHeight,
    setFormulaFontSize,
    setHighContrast,
    setPrimaryColor,
  } = useDisplaySettings();

  return (
    <div className="display-settings-container">
      <h2>הגדרות תצוגה ונגישות</h2>

      {/* גודל גופן כללי */}
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

      {/* מרווח שורות */}
      <div className="setting">
        <label htmlFor="lineHeight">מרווח שורות: {lineHeight.toFixed(1)}</label>
        <input
          id="lineHeight"
          type="range"
          min="1"
          max="2"
          step="0.1"
          value={lineHeight}
          onChange={(e) => setLineHeight(+e.target.value)}
        />
      </div>

      {/* גודל גופן נוסחאות */}
      <div className="setting">
        <label htmlFor="formulaFontSize">גודל נוסחאות: {formulaFontSize}px</label>
        <input
          id="formulaFontSize"
          type="range"
          min="12"
          max="36"
          step="2"
          value={formulaFontSize}
          onChange={(e) => setFormulaFontSize(+e.target.value)}
        />
      </div>

      {/* ניגודיות גבוהה */}
      <div className="setting">
        <label>ניגודיות גבוהה:</label>
        <button
          className={`toggle-btn ${highContrast ? "active" : ""}`}
          onClick={() => setHighContrast(!highContrast)}
        >
          {highContrast ? "פעיל" : "כבוי"}
        </button>
      </div>

      {/* צבע ראשי */}
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
