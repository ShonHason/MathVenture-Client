import React, { useEffect, useState } from 'react';
import './PushToTalkButton.css';

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
  disabled = false
}) => {
  // State for speech bubble initial visibility
  const [showHint, setShowHint] = useState(true);
  
  // Hide hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Keep the keyboard event handlers for spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !disabled && !e.repeat) {
        e.preventDefault(); // Prevent page scrolling
        onTalkStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !disabled) {
        e.preventDefault();
        onTalkEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onTalkStart, onTalkEnd, disabled]);

  return (
    <div className="push-to-talk-container">
      <div className={`speech-bubble ${showHint ? 'show' : ''}`}>
        לחץ על הכפתור או מקש <span className="shortcut">SPACE</span> כדי לדבר
      </div>
      <button
        className={`push-to-talk-button ${isRecording ? 'recording' : ''}`}
        onMouseDown={onTalkStart}
        onMouseUp={onTalkEnd}
        onTouchStart={onTalkStart}
        onTouchEnd={onTalkEnd}
        disabled={disabled}
        aria-label="Push to talk"
        tabIndex={0}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </button>
    </div>
  );
};

export default PushToTalkButton;
