// src/components/DrawableMathNotebook.tsx
import React, { useRef, useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';
import './DrawableMathNotebook.css';

interface DrawableMathNotebookProps {
  question: string;
  onRecognize: (text: string) => void;
}

const DrawableMathNotebook: React.FC<DrawableMathNotebookProps> = ({ question, onRecognize }) => {
  const gridRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string>('');

  // ציור הרשת
  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    size: number = 30
  ) => {
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = '#ccc';
    for (let x = 0; x <= w; x += size) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += size) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  };

  useEffect(() => {
    const grid = gridRef.current!;
    const draw = drawRef.current!;
    const w = grid.offsetWidth;
    const h = grid.offsetHeight;
    grid.width = w; grid.height = h;
    draw.width = w; draw.height = h;

    const gctx = grid.getContext('2d')!;
    drawGrid(gctx, w, h);

    const dctx = draw.getContext('2d')!;
    const md = (e: MouseEvent) => {
      const r = draw.getBoundingClientRect();
      isDrawingRef.current = true;
      lastPosRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const mm = (e: MouseEvent) => {
      if (!isDrawingRef.current || !lastPosRef.current) return;
      const r = draw.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      dctx.beginPath();
      dctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      dctx.lineTo(x, y);
      dctx.strokeStyle = 'black';
      dctx.lineWidth = 6;
      dctx.stroke();
      lastPosRef.current = { x, y };
    };
    const mu = () => {
      isDrawingRef.current = false;
      lastPosRef.current = null;
    };

    draw.addEventListener('mousedown', md);
    draw.addEventListener('mousemove', mm);
    draw.addEventListener('mouseup', mu);
    draw.addEventListener('mouseleave', mu);

    return () => {
      draw.removeEventListener('mousedown', md);
      draw.removeEventListener('mousemove', mm);
      draw.removeEventListener('mouseup', mu);
      draw.removeEventListener('mouseleave', mu);
    };
  }, []);

  const handleClearCanvas = () => {
    const draw = drawRef.current!;
    const ctx = draw.getContext('2d')!;
    ctx.clearRect(0, 0, draw.width, draw.height);
    setRecognizedText('');
  };

  const handleScan = async () => {
    const grid = gridRef.current!;
    const draw = drawRef.current!;
    grid.style.visibility = 'hidden';
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    setOcrLoading(true);
    try {
      const dataUrl = draw.toDataURL('image/png');
      // @ts-ignore: tessedit options not in TS WorkerOptions
      const options: any = {
        tessedit_char_whitelist: '0123456789()+-*/= ',
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      };
      const { data: { text } } = await Tesseract.recognize(dataUrl, 'eng+heb', options);
      const trimmed = text.trim();
      setRecognizedText(trimmed);
      onRecognize(trimmed);
    } catch (err) {
      console.error('OCR error:', err);
      setRecognizedText('');
      onRecognize('');
    } finally {
      setOcrLoading(false);
      grid.style.visibility = 'visible';
      handleClearCanvas();
    }
  };

  return (
    <div className="drawable-notebook-container">
      <div className="canvas-container">
        <canvas ref={gridRef} className="grid-canvas" />
        <canvas ref={drawRef} className="drawable-canvas" />
        <div className="question-overlay">{question}</div>
        <div className="button-group">
          <button onClick={handleScan} className="scan-button" disabled={ocrLoading}>
            {ocrLoading ? 'מזהה…' : 'סריקה'}
          </button>
          <button onClick={handleClearCanvas} className="clear-canvas-button">
            נקה ציור
          </button>
        </div>
      </div>
      {recognizedText && (
        <div className="recognized-text-display">תוצאה: <strong>{recognizedText}</strong></div>
      )}
    </div>
  );
};

export default DrawableMathNotebook;
