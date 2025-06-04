// src/components/FullScreenNotebook.tsx
"use client"; // Important for client-side components in Next.js/React

import React from "react";
import { Minimize, Scan, RefreshCw } from "lucide-react";
import "./FullScreenNotebook.css"; // Import the external CSS
import ControlPanel from "./control-panel"; // Import ControlPanel
import { useControlPanel } from "../context/ControlPanelContext"; // Import useControlPanel hook

interface FullScreenNotebookProps {
  onClose: () => void;
  onScan: () => void;
  onReset: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onReturnToMain: () => void;
}

export default function FullScreenNotebook({
  onClose,
  onScan,
  onReset,
  canvasRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}: FullScreenNotebookProps) {
  // Use the ControlPanel context to get its state and functions
  const {
    isVisible,
    progress,
    currentQuestion,
    correctAnswers,
    isLessonComplete,
    isPlaying,
    isMuted,
    botVolume,
    speechSpeed,
    onTogglePlayPause,
    onAdjustVolume,
    onAdjustSpeed,
    onToggleMute,
    onReturnToMain, // This comes from the context, which gets it from LearningSession
    onRepeatMessage,
  } = useControlPanel();

  return (
    <div className="fullscreen-overlay">
      {/* ControlPanel placed at the very top */}
      <ControlPanel
        progress={progress}
        currentQuestion={currentQuestion}
        correctAnswers={correctAnswers}
        isLessonComplete={isLessonComplete}
        isVisible={isVisible} // Ensure ControlPanel is visible in fullscreen
        isPlaying={isPlaying}
        isMuted={isMuted}
        botVolume={botVolume}
        speechSpeed={speechSpeed}
        onTogglePlayPause={onTogglePlayPause}
        onAdjustVolume={onAdjustVolume}
        onAdjustSpeed={onAdjustSpeed}
        onToggleMute={onToggleMute}
        onReturnToMain={onReturnToMain}
        onRepeatMessage={onRepeatMessage}
      />

      <div className="notebook-container">
        <div className="notebook-header">
          <h2 className="text-xl">מצב ציור מורחב</h2>
          <button onClick={onClose}>
            <Minimize className="h-5 w-5" />
          </button>
        </div>
        <div className="notebook-canvas-container">
          <canvas
            ref={canvasRef}
            width={800}
            height={800}
            className="notebook-canvas"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          />
        </div>
        <div className="notebook-footer">
          <button onClick={onScan} className="action-button">
            <Scan className="h-5 w-5" />
            <span>סריקה</span>
          </button>
          <button onClick={onReset} className="action-button">
            <RefreshCw className="h-5 w-5" />
            <span>איפוס</span>
          </button>
        </div>
      </div>
    </div>
  );
}
// // src/components/FullScreenNotebook.tsx

// import React from "react";
// import { Minimize, Scan, RefreshCw } from "lucide-react";
// import "./FullScreenNotebook.css"; // Import the external CSS

// interface FullScreenNotebookProps {
//   onClose: () => void;
//   onScan: () => void;
//   onReset: () => void;
//   canvasRef: React.RefObject<HTMLCanvasElement>;
//   onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
//   onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
//   onMouseUp: () => void;
//   onMouseLeave: () => void;
// }

// export default function FullScreenNotebook({
//   onClose,
//   onScan,
//   onReset,
//   canvasRef,
//   onMouseDown,
//   onMouseMove,
//   onMouseUp,
//   onMouseLeave,
// }: FullScreenNotebookProps) {
//   return (
//     <div className="fullscreen-overlay">

//       <div className="notebook-container">
//         <div className="notebook-header">
//           <h2 className="text-xl">מצב ציור מורחב</h2>
//           <button onClick={onClose}>
//             <Minimize className="h-5 w-5" />
//           </button>
//         </div>
//         <div className="notebook-canvas-container">
//           <canvas
//             ref={canvasRef}
//             width={800}
//             height={800}
//             className="notebook-canvas"
//             onMouseDown={onMouseDown}
//             onMouseMove={onMouseMove}
//             onMouseUp={onMouseUp}
//             onMouseLeave={onMouseLeave}
//           />
//         </div>
//         <div className="notebook-footer">
//           <button onClick={onScan} className="action-button">
//             <Scan className="h-5 w-5" />
//             <span>סריקה</span>
//           </button>
//           <button onClick={onReset} className="action-button">
//             <RefreshCw className="h-5 w-5" />
//             <span>איפוס</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
