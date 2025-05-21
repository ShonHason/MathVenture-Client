"use client"

import { useRef, useMemo } from "react"
import "./game-board.css"

interface Station {
  id: number
  name: string
  description: string
  color: string
  icon: string
}

interface GameBoardProps {
  stations: Station[]
  currentStationId: number
}

export default function GameBoard({ stations, currentStationId }: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null)

  // Calculate the number of rows and columns based on the number of stations
  const { rows, cols, pathPoints } = useMemo(() => {
    // Determine optimal grid size based on station count
    let cols = 4
    if (stations.length > 12) cols = 5
    else if (stations.length <= 8) cols = 3

    const rows = Math.ceil(stations.length / cols)

    // Generate path points for the snake pattern
    const pathPoints: { x: number; y: number }[] = []

    for (let row = 0; row < rows; row++) {
      const isEvenRow = row % 2 === 0

      if (isEvenRow) {
        // Left to right
        for (let col = 0; col < cols; col++) {
          pathPoints.push({
            x: (col / (cols - 1)) * 90 + 5, // 5-95% width
            y: (row / (rows - 1)) * 90 + 5, // 5-95% height
          })
        }
      } else {
        // Right to left
        for (let col = cols - 1; col >= 0; col--) {
          pathPoints.push({
            x: (col / (cols - 1)) * 90 + 5, // 5-95% width
            y: (row / (rows - 1)) * 90 + 5, // 5-95% height
          })
        }
      }
    }

    // Trim extra points if we have more than stations
    return { rows, cols, pathPoints: pathPoints.slice(0, stations.length) }
  }, [stations.length])

  // Generate SVG path for the snake
  const svgPath = useMemo(() => {
    if (pathPoints.length === 0) return ""

    // Start at the first point
    let path = `M ${pathPoints[0].x},${pathPoints[0].y}`

    // Add line to each subsequent point
    for (let i = 1; i < pathPoints.length; i++) {
      path += ` L ${pathPoints[i].x},${pathPoints[i].y}`
    }

    return path
  }, [pathPoints])

  // Calculate station size based on number of stations
  const stationSize = useMemo(() => {
    // Smaller stations when we have more of them
    if (stations.length > 12) return 3.5
    if (stations.length > 8) return 4
    return 4.5
  }, [stations.length])

  return (
    <div className="game-board-container" ref={boardRef}>
      <div className="game-board">
        {/* Path connecting stations */}
        <div className="path-container">
          <svg className="path" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={svgPath}
              fill="none"
              stroke="#FFD166"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="0"
              className="fun-path"
            />
          </svg>
        </div>

        {/* Stations */}
        {stations.map((station, index) => {
          const isCurrent = station.id === currentStationId
          const isPast = station.id < currentStationId
          const isNext = station.id === currentStationId + 1

          // Use the pre-calculated position
          const position = pathPoints[index] || { x: 0, y: 0 }

          return (
            <div
              id={`station-${station.id}`}
              key={station.id}
              className={`station station-${station.color} ${isCurrent ? "current-station" : ""} ${
                isPast ? "past-station" : ""
              }`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${stationSize}rem`,
                height: `${stationSize}rem`,
              }}
            >
              <div className="station-content">
                <div className="station-icon">{station.icon}</div>
                <div className="station-number">{station.id}</div>
              </div>
              {isCurrent && (
                <>
                  <div className="station-glow"></div>
                  <div className="station-marker"></div>
                  <div className="station-pulse"></div>
                </>
              )}
              <div className={`station-name ${isCurrent ? "station-name-current" : ""}`}>{station.name}</div>
            </div>
          )
        })}

        {/* Decorative elements */}
        <div className="decoration star-1"></div>
        <div className="decoration star-2"></div>
        <div className="decoration star-3"></div>
        <div className="decoration circle-1"></div>
        <div className="decoration circle-2"></div>
        <div className="decoration circle-3"></div>
      </div>
    </div>
  )
}
