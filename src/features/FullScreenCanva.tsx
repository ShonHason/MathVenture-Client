import React, { useRef, useEffect, useState } from "react";
import "./FullScreenCanva.css";
import FullScreenMenu from "./FullScreenMenu";
import { useActionButtons } from "../context/ActionButtonsContext";
import { useDrawingSettings } from "../context/DrawingSettingsContext";

interface FullScreenCanvasProps {
  imageSrc: string; // base64 of the current drawing
  onClose: () => void;
  onSave?: (updatedImage: string) => void;
  externalCanvasRef?: React.MutableRefObject<HTMLCanvasElement | null>;
}

const FullScreenCanvas: React.FC<FullScreenCanvasProps> = ({
  imageSrc,
  onClose,
  onSave,
  externalCanvasRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLCanvasElement>(null!);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const { scanRequested } = useActionButtons();
  const { penWidth, setPenWidth, gridCount, setGridCount } =
    useDrawingSettings();
  useEffect(() => {
    if (externalCanvasRef) {
      externalCanvasRef.current = canvasRef.current;
    }
  }, [externalCanvasRef]);

  // Resize & initialize both canvases
  useEffect(() => {
    const drawCanvas = canvasRef.current;
    const gridCanvas = gridRef.current;
    const drawCtx = drawCanvas?.getContext("2d");
    const gridCtx = gridCanvas?.getContext("2d");

    if (!drawCanvas || !drawCtx || !gridCanvas || !gridCtx) return;

    const resizeCanvas = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Drawing canvas
      drawCanvas.width = w;
      drawCanvas.height = h;

      const img = new Image();
      img.onload = () => {
        drawCtx.clearRect(0, 0, w, h);
        drawCtx.drawImage(img, 0, 0, w, h);
      };
      img.src = imageSrc;

      // Grid canvas
      gridCanvas.width = w;
      gridCanvas.height = h;

      // const adjustedGridCount = 20 * 2;
      const adjustedGridCount = gridCount * 2;

      const columns = Math.floor(adjustedGridCount);
      const tileSize = w / columns;
      const rows = Math.floor(h / tileSize);

      gridCtx.clearRect(0, 0, w, h);
      gridCtx.beginPath();
      gridCtx.strokeStyle = "#eee";
      gridCtx.lineWidth = 1;

      for (let i = 0; i <= columns; i++) {
        const x = Math.floor(i * tileSize) + 0.5;
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, h);
      }

      for (let j = 0; j <= rows; j++) {
        const y = Math.floor(j * tileSize) + 0.5;
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(w, y);
      }

      gridCtx.stroke();
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [imageSrc, gridCount]);

  // Redraw image only when scan is triggered (so you see only the image)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
    };
    img.src = imageSrc;
  }, [scanRequested]);

  const handleSave = () => {
    const originalCanvas = canvasRef.current;
    if (!originalCanvas || !onSave) return;

    const w = originalCanvas.width;
    const h = originalCanvas.height;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    const imageData = originalCanvas.getContext("2d")!.getImageData(0, 0, w, h);
    tempCtx.putImageData(imageData, 0, 0);

    const drawingOnly = tempCanvas.toDataURL("image/png");
    onSave(drawingOnly);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    const startDraw = (e: MouseEvent) => {
      isDrawing.current = true;
      lastPos.current = getPos(e);
    };

    const draw = (e: MouseEvent) => {
      if (!isDrawing.current || !lastPos.current) return;
      const { x, y } = getPos(e);
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = penWidth;
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastPos.current = { x, y };
    };

    const stopDraw = () => {
      isDrawing.current = false;
      lastPos.current = null;
      handleSave();
    };

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);

    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDraw);
      canvas.removeEventListener("mouseleave", stopDraw);
    };
  }, [penWidth]);

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Save a blank image to the notebook to clear it too
    if (onSave) {
      const blank = canvasRef.current?.toDataURL("image/png");
      if (blank) {
        onSave(blank);
      }
    }
  };

  return (
    <>
      <div className="fullscreen-canvas-wrapper">
        <canvas ref={canvasRef} className="fullscreen-canvas" />
        <canvas ref={gridRef} className="grid-canvas" />
      </div>

      <FullScreenMenu onClear={clearCanvas} isOpen={true} onClose={onClose} />
    </>
  );
};

export default FullScreenCanvas;
