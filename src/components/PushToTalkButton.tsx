import React, { useState, useEffect } from "react";
import "./PushToTalkButton.css";

interface PushToTalkButtonProps {
  onTalkStart: () => void;
  onTalkEnd: () => void;
  isRecording: boolean;
  disabled?: boolean;
}

const PushToTalkButton: React.FC<PushToTalkButtonProps> = ({
  onTalkStart,
  onTalkEnd,
  isRecording,
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  // Handle mouse events
  const handleMouseDown = () => {
    if (disabled) return;
    setIsPressed(true);
    setIsHolding(true);
    onTalkStart();
  };

  const handleMouseUp = () => {
    if (disabled) return;
    setIsPressed(false);
    setIsHolding(false);
    onTalkEnd();
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsPressed(true);
    setIsHolding(true);
    onTalkStart();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsPressed(false);
    setIsHolding(false);
    onTalkEnd();
  };

  // Handle keyboard events (spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !disabled) {
        e.preventDefault();
        if (!isHolding) {
          setIsPressed(true);
          setIsHolding(true);
          onTalkStart();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && !disabled) {
        e.preventDefault();
        setIsPressed(false);
        setIsHolding(false);
        onTalkEnd();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isHolding, disabled, onTalkStart, onTalkEnd]);

  // Prevent context menu on long press
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="push-to-talk-container">
      <button
        className={`push-to-talk-button ${isPressed ? "pressed" : ""} ${
          isRecording ? "recording" : ""
        } ${disabled ? "disabled" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop if mouse leaves button
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        disabled={disabled}
        type="button"
      >
        <div className="button-content">
          <div className="microphone-icon">{isRecording ? "🎤" : "🎙️"}</div>
          <div className="button-text">
            {isPressed ? "מדבר..." : "לחץ כדי לדבר"}
          </div>
          <div className="spacebar-hint">(או לחץ רווח)</div>
        </div>
        {isRecording && (
          <div className="recording-indicator">
            <div className="pulse-ring"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default PushToTalkButton;
