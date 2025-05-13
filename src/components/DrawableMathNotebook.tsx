// src/components/DrawableMathNotebook.tsx
import React, { useRef, useEffect, useState } from "react";
import Tesseract from "tesseract.js";
import ToggleSwitch from "./ToggleSwitch";
import MathKeypad from "./MathKeypad";
import ActionButtons from "./ActionButtons";
import "./DrawableMathNotebook.css";

interface DrawableMathNotebookProps {
  question: string;
  onRecognize: (text: string) => void;
  isSpeaking: boolean;
}

const DrawableMathNotebook: React.FC<DrawableMathNotebookProps> = ({
  question,
  onRecognize,
  isSpeaking,
}) => {
  const [isKeyboard, setIsKeyboard] = useState(false);
  const [penWidth, setPenWidth] = useState(6);
  const [gridVisible, setGridVisible] = useState(true);
  const [gridCount, setGridCount] = useState(20);
  const [scanning, setScanning] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [expression, setExpression] = useState("");

  const gridRef = useRef<HTMLCanvasElement>(null!);
  const drawRef = useRef<HTMLCanvasElement>(null!);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // DRAW MODE: grid + freehand
  useEffect(() => {
    if (isKeyboard) return;
    const grid = gridRef.current;
    const draw = drawRef.current;
    const w = grid.offsetWidth;
    const h = grid.offsetHeight;
    grid.width = w;
    grid.height = h;
    draw.width = w;
    draw.height = h;

    const gctx = grid.getContext("2d")!;
    if (gridVisible) {
      const size = Math.min(w, h) / gridCount;
      gctx.clearRect(0, 0, w, h);
      gctx.beginPath();
      gctx.strokeStyle = "#ddd";
      for (let x = 0; x <= w; x += size) {
        gctx.moveTo(x, 0);
        gctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += size) {
        gctx.moveTo(0, y);
        gctx.lineTo(w, y);
      }
      gctx.stroke();
    } else {
      gctx.clearRect(0, 0, w, h);
    }

    const dctx = draw.getContext("2d")!;
    dctx.lineCap = "round";
    const start = (e: MouseEvent) => {
      const rect = draw.getBoundingClientRect();
      isDrawing.current = true;
      lastPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const move = (e: MouseEvent) => {
      if (!isDrawing.current || !lastPos.current) return;
      const rect = draw.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dctx.strokeStyle = "#000";
      dctx.lineWidth = penWidth;
      dctx.beginPath();
      dctx.moveTo(lastPos.current.x, lastPos.current.y);
      dctx.lineTo(x, y);
      dctx.stroke();
      lastPos.current = { x, y };
    };
    const end = () => {
      isDrawing.current = false;
      lastPos.current = null;
    };

    draw.addEventListener("mousedown", start);
    draw.addEventListener("mousemove", move);
    draw.addEventListener("mouseup", end);
    draw.addEventListener("mouseleave", end);
    return () => {
      draw.removeEventListener("mousedown", start);
      draw.removeEventListener("mousemove", move);
      draw.removeEventListener("mouseup", end);
      draw.removeEventListener("mouseleave", end);
    };
  }, [isKeyboard, penWidth, gridVisible, gridCount]);

  // CLEAR both modes
  const handleClear = () => {
    // Clear local state only, do not call onRecognize to avoid triggering API with empty input
    if (isKeyboard) {
      setExpression("");
      setRecognizedText("");
    } else {
      const dctx = drawRef.current.getContext("2d")!;
      dctx.clearRect(0, 0, drawRef.current.width, drawRef.current.height);
      setRecognizedText("");
    }
  };

  // SCAN both modes + reset expression row
  const handleScan = async () => {
    if (isSpeaking) {
      console.warn("Scan blocked: avatar is speaking");
      return;
    }
    setScanning(true);
    try {
      if (isKeyboard) {
        onRecognize(expression);
        // reset expression after scan
        setExpression("");
      } else {
        const grid = gridRef.current;
        const draw = drawRef.current;
        const prevVis = grid.style.visibility;
        grid.style.visibility = "hidden";
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r))
        );
        const dataUrl = draw.toDataURL("image/png");
        // @ts-ignore
        const opts: any = {
          tessedit_char_whitelist: "0123456789()+-*/= ",
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        };
        const {
          data: { text },
        } = await Tesseract.recognize(dataUrl, "eng+heb", opts);
        const trimmed = text.trim();
        setRecognizedText(trimmed);
        onRecognize(trimmed);
        grid.style.visibility = prevVis;
        draw.getContext("2d")!.clearRect(0, 0, draw.width, draw.height);
      }
    } catch {
      setRecognizedText("");
      onRecognize("");
    } finally {
      setScanning(false);
    }
  };

  // NUMPAD input
  const handleNumClick = (k: string) => {
    const next = expression + k;
    setExpression(next);
    setRecognizedText(next);
  };

  return (
    <div className="drawable-notebook-container">
      {!isKeyboard && (
        <button className="net" onClick={() => setGridVisible((v) => !v)}>
          {gridVisible ? "הסתר רשת" : "הצג רשת"}
        </button>
      )}

      <ToggleSwitch checked={isKeyboard} onChange={setIsKeyboard} />

      {isKeyboard ? (
        <div className="keyboard-mode">
          <div className="expression-row">{expression || " "}</div>
          <MathKeypad onPress={handleNumClick} />
          <ActionButtons
            scanning={scanning}
            onScan={handleScan}
            onClear={handleClear}
          />
        </div>
      ) : (
        <>
          <div className="canvas-container">
            <canvas ref={gridRef} className="grid-canvas" />
            <canvas ref={drawRef} className="drawable-canvas" />
            <div className="question-overlay">{question}</div>
          </div>
          <div className="controls-row">
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

            <ActionButtons
              scanning={scanning}
              onScan={handleScan}
              onClear={handleClear}
            />
          </div>
        </>
      )}

      {recognizedText && (
        <div className="recognized-text-display">
          תוצאה: <strong>{recognizedText}</strong>
        </div>
      )}
    </div>
  );
};

export default DrawableMathNotebook;
