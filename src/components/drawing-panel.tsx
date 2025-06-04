// src/components/DrawingPanel.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Maximize, Minimize, Scan, RefreshCw } from "lucide-react";
import FullScreenNotebook from "./FullScreenNotebook";

interface DrawingPanelProps {
  onScan: (canvas: HTMLCanvasElement) => void;
}

export default function DrawingPanel({ onScan }: DrawingPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const GRID_CELLS = 20;

  useEffect(() => {
    if (canvasRef.current) initializeCanvas(canvasRef.current);
  }, []);

  useEffect(() => {
    if (isFullscreen && fullscreenCanvasRef.current) {
      initializeCanvas(fullscreenCanvasRef.current);
      if (canvasRef.current) {
        const fsCtx = fullscreenCanvasRef.current.getContext("2d");
        fsCtx?.drawImage(
          canvasRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
          0,
          0,
          fullscreenCanvasRef.current.width,
          fullscreenCanvasRef.current.height
        );
      }
    }
  }, [isFullscreen]);

  const initializeCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = "#ffcbcb";
    ctx.lineWidth = 1;
    const cellW = w / GRID_CELLS;
    const cellH = h / GRID_CELLS;
    ctx.translate(0.5, 0.5);
    for (let i = 0; i <= GRID_CELLS; i++) {
      const x = Math.floor(i * cellW);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_CELLS; i++) {
      const y = Math.floor(i * cellH);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.translate(-0.5, -0.5);
  };

  const getCanvas = () =>
    isFullscreen ? fullscreenCanvasRef.current : canvasRef.current;

  const getNormalizedCoords = (
    e: React.MouseEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = getCanvas();
    if (!c) return;
    const { x, y } = getNormalizedCoords(e, c);
    setLastX(x);
    setLastY(y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const c = getCanvas();
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const { x, y } = getNormalizedCoords(e, c);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = isFullscreen ? 6 : 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    setLastX(x);
    setLastY(y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (isFullscreen && fullscreenCanvasRef.current && canvasRef.current) {
      const smallCtx = canvasRef.current.getContext("2d");
      if (!smallCtx) return;
      initializeCanvas(canvasRef.current);
      smallCtx.drawImage(
        fullscreenCanvasRef.current,
        0,
        0,
        fullscreenCanvasRef.current.width,
        fullscreenCanvasRef.current.height,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
  };

  const toggleFullscreen = () => setIsFullscreen((f) => !f);

  const handleScanClick = () => {
    const c = getCanvas();
    if (c) onScan(c);
  };

  const handleReset = () => {
    if (canvasRef.current) initializeCanvas(canvasRef.current);
    if (fullscreenCanvasRef.current && isFullscreen)
      initializeCanvas(fullscreenCanvasRef.current);
  };

  return (
    <>
      <div className="flex-1 bg-blue-50 rounded-xl mb-4 p-2 relative border-2 border-blue-100">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-full cursor-crosshair rounded-lg"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <button
          className="absolute bottom-2 right-2 bg-white p-2 rounded-full hover:bg-blue-50"
          onClick={toggleFullscreen}
        >
          <Maximize className="h-5 w-5 text-blue-500" />
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleScanClick}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Scan className="h-5 w-5" />
          <span>סריקה</span>
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          <span>איפוס</span>
        </button>
      </div>

      {isFullscreen && (
        <FullScreenNotebook
          onClose={toggleFullscreen}
          onScan={handleScanClick}
          onReset={handleReset}
          canvasRef={fullscreenCanvasRef as React.RefObject<HTMLCanvasElement>}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onReturnToMain={toggleFullscreen}
        />
      )}
    </>
  );
}
