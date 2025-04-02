import React, { useRef, useEffect } from 'react';
import './DrawableMathNotebook.css';

interface DrawableMathNotebookProps {
  question: string;
}

const DrawableMathNotebook: React.FC<DrawableMathNotebookProps> = ({ question }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use refs to track drawing state without causing re-renders
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Draw the grid on the canvas.
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, gridSize: number = 30) => {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = '#ccc';
    for (let x = 0; x <= width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match its display size.
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawGrid(ctx, canvas.width, canvas.height);

    // Event handlers for drawing.
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      isDrawingRef.current = true;
      lastPosRef.current = { x, y };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawingRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (lastPosRef.current) {
        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.stroke();
        lastPosRef.current = { x, y };
      }
    };

    const handleMouseUpOrLeave = () => {
      isDrawingRef.current = false;
      lastPosRef.current = null;
    };

    // Attach event listeners.
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUpOrLeave);
    canvas.addEventListener('mouseleave', handleMouseUpOrLeave);

    // Cleanup on unmount.
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUpOrLeave);
      canvas.removeEventListener('mouseleave', handleMouseUpOrLeave);
    };
  }, []);

  // Clears the canvas and redraws the grid.
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawGrid(ctx, canvas.width, canvas.height);
  };

  // פונקציה לטיפול בלחצן סריקה
  const handleScan = () => {
    console.log('לחצן סריקה נלחץ');
    // כאן ניתן להוסיף את הלוגיקה לביצוע סריקה
  };

  return (
    <div className="drawable-notebook-container">
      <div className="canvas-container">
        <canvas ref={canvasRef} className="drawable-canvas" />
        {/* השאלה מוצגת על המשטח */}
        <div className="question-overlay">{question}</div>
        {/* קבוצת לחצנים מופיעה על המשטח בתחתית */}
        <div className="button-group">
          <button onClick={handleScan} className="scan-button">
            סריקה
          </button>
          <button onClick={handleClearCanvas} className="clear-canvas-button">
            נקה ציור
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawableMathNotebook;
