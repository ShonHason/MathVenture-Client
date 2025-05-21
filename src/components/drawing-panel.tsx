"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Maximize, Minimize, Scan, RefreshCw } from "lucide-react"

export default function DrawingPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Define a consistent grid cell count for both canvases
  const GRID_CELLS = 20

  // Initialize the canvas when the component mounts
  useEffect(() => {
    if (canvasRef.current) {
      initializeCanvas(canvasRef.current)
    }
  }, [])

  // Handle fullscreen mode changes
  useEffect(() => {
    if (isFullscreen && fullscreenCanvasRef.current) {
      // Initialize the fullscreen canvas with the same grid
      initializeCanvas(fullscreenCanvasRef.current)

      // Copy content from small canvas if there's any drawing
      if (canvasRef.current) {
        const fsCtx = fullscreenCanvasRef.current.getContext("2d")
        if (fsCtx) {
          fsCtx.drawImage(
            canvasRef.current,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
            0,
            0,
            fullscreenCanvasRef.current.width,
            fullscreenCanvasRef.current.height,
          )
        }
      }
    }
  }, [isFullscreen])

  // Initialize a canvas with the grid
  const initializeCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear the canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw a clean white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw the grid with precise measurements
    drawGrid(ctx, canvas.width, canvas.height)
  }

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Use a light pink color for grid lines to match the original code
    ctx.strokeStyle = "#ffcbcb"
    ctx.lineWidth = 1

    // Calculate cell size based on canvas dimensions and fixed cell count
    const cellWidth = width / GRID_CELLS
    const cellHeight = height / GRID_CELLS

    // Ensure we're drawing on pixel boundaries for sharp lines
    ctx.translate(0.5, 0.5)

    // Draw vertical lines
    for (let i = 0; i <= GRID_CELLS; i++) {
      const x = Math.floor(i * cellWidth)
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let i = 0; i <= GRID_CELLS; i++) {
      const y = Math.floor(i * cellHeight)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Reset translation
    ctx.translate(-0.5, -0.5)
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = isFullscreen ? fullscreenCanvasRef.current : canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setLastX(x)
    setLastY(y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = isFullscreen ? fullscreenCanvasRef.current : canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.strokeStyle = "#000000"
    ctx.lineWidth = isFullscreen ? 6 : 3 // Match the original pen width
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()

    setLastX(x)
    setLastY(y)
  }

  const stopDrawing = () => {
    setIsDrawing(false)

    // If we were drawing in fullscreen, copy the result back to the small canvas
    if (isFullscreen && fullscreenCanvasRef.current && canvasRef.current) {
      const smallCtx = canvasRef.current.getContext("2d")
      if (smallCtx) {
        // Clear the small canvas and redraw the grid
        smallCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        smallCtx.fillStyle = "#ffffff"
        smallCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        drawGrid(smallCtx, canvasRef.current.width, canvasRef.current.height)

        // Scale down and copy the fullscreen canvas content
        smallCtx.drawImage(
          fullscreenCanvasRef.current,
          0,
          0,
          fullscreenCanvasRef.current.width,
          fullscreenCanvasRef.current.height,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
        )
      }
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleScan = () => {
    console.log("Scanning drawing")
    // Implement scanning logic here
  }

  const handleReset = () => {
    // Reset both canvases to their initial state
    if (canvasRef.current) {
      initializeCanvas(canvasRef.current)
    }

    if (isFullscreen && fullscreenCanvasRef.current) {
      initializeCanvas(fullscreenCanvasRef.current)
    }

    console.log("Drawing reset")
  }

  // Handle touch events for mobile devices
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const canvas = isFullscreen ? fullscreenCanvasRef.current : canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top

      setIsDrawing(true)
      setLastX(x)
      setLastY(y)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || e.touches.length !== 1) return

    const touch = e.touches[0]
    const canvas = isFullscreen ? fullscreenCanvasRef.current : canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    ctx.strokeStyle = "#000000"
    ctx.lineWidth = isFullscreen ? 6 : 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.stroke()

    setLastX(x)
    setLastY(y)

    // Prevent scrolling while drawing
    e.preventDefault()
  }

  const handleTouchEnd = () => {
    setIsDrawing(false)

    // If we were drawing in fullscreen, copy the result back to the small canvas
    if (isFullscreen && fullscreenCanvasRef.current && canvasRef.current) {
      const smallCtx = canvasRef.current.getContext("2d")
      if (smallCtx) {
        // Clear the small canvas and redraw the grid
        smallCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        smallCtx.fillStyle = "#ffffff"
        smallCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        drawGrid(smallCtx, canvasRef.current.width, canvasRef.current.height)

        // Scale down and copy the fullscreen canvas content
        smallCtx.drawImage(
          fullscreenCanvasRef.current,
          0,
          0,
          fullscreenCanvasRef.current.width,
          fullscreenCanvasRef.current.height,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
        )
      }
    }
  }

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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        <button
          className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-blue-50 transition-colors"
          onClick={toggleFullscreen}
        >
          <Maximize className="h-5 w-5 text-blue-500" />
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleScan}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
        >
          <Scan className="h-5 w-5" />
          <span>סריקה</span>
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          <span>איפוס</span>
        </button>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">מצב ציור מורחב</h2>
              <div className="flex gap-2">
                <button
                  className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors"
                  onClick={toggleFullscreen}
                  aria-label="Minimize"
                >
                  <Minimize className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="flex-1 p-6 bg-blue-50 m-4 rounded-xl shadow-inner overflow-hidden border-2 border-blue-100">
              <canvas
                ref={fullscreenCanvasRef}
                width={800}
                height={800}
                className="w-full h-full cursor-crosshair rounded-lg"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </div>

            {/* Footer with buttons */}
            <div className="p-4 bg-gray-50 flex justify-center gap-6">
              <button
                onClick={handleScan}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2"
              >
                <Scan className="h-5 w-5" />
                <span>סריקה</span>
              </button>
              <button
                onClick={handleReset}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>איפוס</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
