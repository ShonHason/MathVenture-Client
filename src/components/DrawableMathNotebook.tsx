// DrawableMathNotebook.tsx
import React, { useRef, useEffect, useState } from "react";
import Tesseract from "tesseract.js";
import MathKeypad from "./MathKeypad";
import ActionButtons from "./ActionButtons";
import FullScreenCanva from "../features/FullScreenCanva";
import "./DrawableMathNotebook.css";
import { useActionButtons } from "../context/ActionButtonsContext";
import { useDrawingSettings } from "../context/DrawingSettingsContext";

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
  // const [isKeyboard, setIsKeyboard] = useState(false);
  // const [penWidth, setPenWidth] = useState(6);
  const [gridVisible, setGridVisible] = useState(true);
  // const [gridCount, setGridCount] = useState(20);
  // const [scanning, setScanning] = useState(false);
  // const [recognizedText, setRecognizedText] = useState("");
  // const [expression, setExpression] = useState("");
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const gridRef = useRef<HTMLCanvasElement>(null!);
  const drawRef = useRef<HTMLCanvasElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    scanRequested,
    scanning,
    setScanning,
    expression,
    setExpression,
    recognizedText,
    setRecognizedText,
    isKeyboard,
    setIsKeyboard,
  } = useActionButtons();

  const { penWidth, setPenWidth, gridCount, setGridCount } =
    useDrawingSettings();

  useEffect(() => {
    const doScan = async () => {
      if (isSpeaking) return;

      setScanning(true);
      try {
        if (isKeyboard) {
          onRecognize(expression);
          setExpression("");
        } else {
          const grid = gridRef.current;
          const draw = drawRef.current;

          await new Promise((r) =>
            requestAnimationFrame(() => requestAnimationFrame(r))
          );
          const dataUrl = draw.toDataURL("image/png");
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
          draw.getContext("2d")!.clearRect(0, 0, draw.width, draw.height);
        }
      } catch {
        setRecognizedText("");
        onRecognize("");
      } finally {
        setScanning(false);
      }
    };

    doScan();
  }, [scanRequested]);

  const handleSaveImage = (updatedImage: string) => {
    const img = new Image();
    img.onload = () => {
      const ctx = drawRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, drawRef.current.width, drawRef.current.height);
        ctx.drawImage(img, 0, 0, drawRef.current.width, drawRef.current.height);
      }
    };
    img.src = updatedImage;
  };
  const getDrawingAsImage = (): string => {
    const canvas = drawRef.current;
    return canvas.toDataURL("image/png");
  };

  const handleFullscreen = () => {
    const image = getDrawingAsImage();
    setFullScreenImage(image);
  };

  useEffect(() => {
    if (isKeyboard) return;
    const grid = gridRef.current;
    const draw = drawRef.current;
    const container = containerRef.current;
    if (!grid || !draw || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    grid.width = w;
    grid.height = h;
    draw.width = w;
    draw.height = h;

    const gctx = grid.getContext("2d")!;
    if (gridVisible) {
      gctx.clearRect(0, 0, w, h);
      gctx.beginPath();
      gctx.strokeStyle = "#ddd";

      // Make tiles smaller by increasing column count
      const adjustedGridCount = gridCount * 2;
      const columns = Math.floor(adjustedGridCount);
      const tileSize = w / columns;
      const rows = Math.floor(h / tileSize);

      // Vertical lines
      for (let i = 0; i <= columns; i++) {
        const x = Math.floor(i * tileSize) + 0.5;
        gctx.moveTo(x, 0);
        gctx.lineTo(x, h);
      }

      // Horizontal lines
      for (let j = 0; j <= rows; j++) {
        const y = Math.floor(j * tileSize) + 0.5;
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
      const scaleX = draw.width / rect.width;
      const scaleY = draw.height / rect.height;

      isDrawing.current = true;
      lastPos.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const move = (e: MouseEvent) => {
      if (!isDrawing.current || !lastPos.current) return;

      const rect = draw.getBoundingClientRect();
      const scaleX = draw.width / rect.width;
      const scaleY = draw.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

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

  const handleClear = () => {
    if (isKeyboard) {
      setExpression("");
      setRecognizedText("");
    } else {
      const dctx = drawRef.current.getContext("2d")!;
      dctx.clearRect(0, 0, drawRef.current.width, drawRef.current.height);
      setRecognizedText("");
    }
  };

  const handleScan = async () => {
    if (isSpeaking) return;
    setScanning(true);
    try {
      if (isKeyboard) {
        onRecognize(expression);
        setExpression("");
      } else {
        const grid = gridRef.current;
        const draw = drawRef.current;
        // const prevVis = grid.style.visibility;
        // grid.style.visibility = "hidden";

        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r))
        );
        const dataUrl = draw.toDataURL("image/png");
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
        // grid.style.visibility = prevVis;
        draw.getContext("2d")!.clearRect(0, 0, draw.width, draw.height);
      }
    } catch {
      setRecognizedText("");
      onRecognize("");
    } finally {
      setScanning(false);
    }
  };

  const handleNumClick = (k: string) => {
    const next = expression + k;
    setExpression(next);
    setRecognizedText(next);
  };

  return (
    <div className="drawable-notebook-container" ref={containerRef}>
      {isKeyboard ? (
        <div className="keyboard-mode">
          <div className="expression-row">{expression || " "}</div>
          <MathKeypad onPress={handleNumClick} />
          <ActionButtons
            isKeyboard={isKeyboard}
            setIsKeyboard={setIsKeyboard}
            scanning={scanning}
            onScan={handleScan}
            onClear={handleClear}
            setFullScreen={handleFullscreen}
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
              isKeyboard={isKeyboard}
              setIsKeyboard={setIsKeyboard}
              setFullScreen={handleFullscreen}
            />
          </div>
        </>
      )}
      {recognizedText && (
        <div className="recognized-text-display">
          תוצאה: <strong>{recognizedText}</strong>
        </div>
      )}
      {fullScreenImage && (
        <FullScreenCanva
          imageSrc={fullScreenImage}
          onClose={() => setFullScreenImage(null)}
          onSave={handleSaveImage}
          externalCanvasRef={fullscreenCanvasRef}
        />
      )}
    </div>
  );
};

export default DrawableMathNotebook;
