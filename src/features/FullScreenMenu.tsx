import React from "react";
import "./FullScreenMenu.css";
import { useAvatar } from "../context/AvatarContext";
import { useActionButtons } from "../context/ActionButtonsContext";
import { useDrawingSettings } from "../context/DrawingSettingsContext";

interface FullScreenMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  onClear: () => void;
}

const FullScreenMenu: React.FC<FullScreenMenuProps> = ({
  isOpen,
  onClose,
  children,
  onClear,
}) => {
  const { avatarComponent, isSpeaking } = useAvatar();
  const { triggerScan } = useActionButtons();
  const { penWidth, setPenWidth, gridCount, setGridCount } =
    useDrawingSettings();
  if (!isOpen) return null;

  return (
    <div className="fullscreen-menu">
      <button
        title="close full screen"
        className="close-button"
        onClick={onClose}
      >
        &times;
      </button>

      <div className="fullscreen-avatar-wrapper">
        {avatarComponent ?? <p>Avatar not set</p>}
      </div>

      <div className="fullscreen-actions">
        <button onClick={onClear} className="btn fullscreen-clear-btn">
          נקה
        </button>
        <button
          className="btn scan-btn"
          disabled={isSpeaking}
          onClick={triggerScan}
        >
          סריקה
        </button>
        <label>רוחב עט: {penWidth}</label>
        <input
          type="range"
          min={1}
          max={20}
          value={penWidth}
          onChange={(e) => setPenWidth(+e.target.value)}
        />
        <label>
          ריבועים: {gridCount}×{gridCount}
        </label>
        <input
          type="number"
          min={5}
          max={50}
          value={gridCount}
          onChange={(e) => setGridCount(+e.target.value)}
        />
      </div>

      <nav>{children}</nav>
    </div>
  );
};

export default FullScreenMenu;
