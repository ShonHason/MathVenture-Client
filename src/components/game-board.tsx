"use client";

import { useRef, useMemo } from "react";
import "./game-board.css";

interface Station {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface GameBoardProps {
  stations: Station[];
  currentStationId: number;
}

export default function GameBoard({
  stations,
  currentStationId,
}: GameBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);

  // Calculate the number of rows and columns based on the number of stations
  const { pathPoints, rows, cols } = useMemo(() => {
    // Determine optimal grid size based on station count
    let cols = 4;
    if (stations.length > 20) cols = 6;
    else if (stations.length > 16) cols = 5;
    else if (stations.length > 12) cols = 5;
    else if (stations.length <= 8) cols = 3;

    const rows = Math.ceil(stations.length / cols);

    // Generate path points for the snake pattern
    const pathPoints: {
      x: number;
      y: number;
      row: number;
      col: number;
      isEdge: boolean;
    }[] = [];

    for (let row = 0; row < rows; row++) {
      const isEvenRow = row % 2 === 0;

      if (isEvenRow) {
        // Left to right
        for (let col = 0; col < cols; col++) {
          const stationIndex = pathPoints.length;
          if (stationIndex >= stations.length) break;

          const isEdge =
            col === 0 || col === cols - 1 || row === 0 || row === rows - 1;

          pathPoints.push({
            x: (col / (cols - 1)) * 90 + 5, // 5-95% width
            y: (row / (rows - 1)) * 90 + 5, // 5-95% height
            row,
            col,
            isEdge,
          });
        }
      } else {
        // Right to left
        for (let col = cols - 1; col >= 0; col--) {
          const stationIndex = pathPoints.length;
          if (stationIndex >= stations.length) break;

          const isEdge =
            col === 0 || col === cols - 1 || row === 0 || row === rows - 1;

          pathPoints.push({
            x: (col / (cols - 1)) * 90 + 5, // 5-95% width
            y: (row / (rows - 1)) * 90 + 5, // 5-95% height
            row,
            col,
            isEdge,
          });
        }
      }
    }

    // Trim extra points if we have more than stations
    return {
      rows,
      cols,
      pathPoints: pathPoints.slice(0, stations.length),
    };
  }, [stations.length]);

  // Generate SVG path for the snake
  const svgPath = useMemo(() => {
    if (pathPoints.length === 0) return "";

    // Start at the first point
    let path = `M ${pathPoints[0].x},${pathPoints[0].y}`;

    // Add line to each subsequent point
    for (let i = 1; i < pathPoints.length; i++) {
      path += ` L ${pathPoints[i].x},${pathPoints[i].y}`;
    }

    return path;
  }, [pathPoints]);

  // Dynamic function to get adjusted position for any station
  const getAdjustedPosition = (
    stationIndex: number,
    originalPosition: {
      x: number;
      y: number;
      row: number;
      col: number;
      isEdge: boolean;
    }
  ) => {
    let adjustedPosition = { ...originalPosition };

    // Get spacing between stations dynamically
    const verticalSpacing = rows > 1 ? 90 / (rows - 1) : 0;
    const horizontalSpacing = cols > 1 ? 90 / (cols - 1) : 0;

    // Dynamic adjustments based on position in grid
    const { row, col } = originalPosition;

    // Adjust top row stations (move down slightly)
    if (row === 0 && rows > 2) {
      adjustedPosition.y += Math.min(2, verticalSpacing * 0.2);
    }

    // Adjust bottom row stations (move up slightly)
    if (row === rows - 1 && rows > 2) {
      adjustedPosition.y -= Math.min(2, verticalSpacing * 0.1);
    }

    // Adjust leftmost stations (move right slightly)
    if (col === 0 && cols > 2) {
      adjustedPosition.x += Math.min(2, horizontalSpacing * 0.001);
    }

    // Adjust rightmost stations (move left slightly)
    if (col === cols - 1 && cols > 2) {
      adjustedPosition.x -= Math.min(2, horizontalSpacing * 0.001);
    }

    // For grids with many stations, provide additional spacing adjustments
    if (stations.length > 12) {
      // Middle rows get slight adjustments to prevent overcrowding
      if (row > 0 && row < rows - 1) {
        // Alternate slight vertical adjustments for visual variety
        const adjustment = row % 2 === 0 ? 1 : -1;
        adjustedPosition.y += adjustment;
      }
    }

    // Ensure positions stay within bounds
    adjustedPosition.x = Math.max(3, Math.min(97, adjustedPosition.x));
    adjustedPosition.y = Math.max(3, Math.min(97, adjustedPosition.y));

    return adjustedPosition;
  };

  // Function to determine if station name should be on top
  const shouldNameBeOnTop = (
    stationIndex: number,
    position: { row: number; col: number }
  ) => {
    const { row } = position;
    // Put names on top for bottom row stations to avoid clipping
    return row === rows - 1;
  };

  return (
    <div className="game-board-container" ref={boardRef}>
      <div className="game-board">
        <div className="path-container">
          <svg
            className="path"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d={svgPath}
              fill="none"
              stroke="#ffffff"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="0"
              className="fun-path"
            />
          </svg>
        </div>

        {/* Stations */}
        {stations.map((station, index) => {
          const isCurrent = station.id === currentStationId;
          const isPast = station.id < currentStationId;

          // Use the pre-calculated position and apply dynamic adjustments
          const originalPosition = pathPoints[index] || {
            x: 0,
            y: 0,
            row: 0,
            col: 0,
            isEdge: false,
          };
          const adjustedPosition = getAdjustedPosition(index, originalPosition);
          const nameOnTop = shouldNameBeOnTop(index, originalPosition);

          return (
            <div
              id={`station-${station.id}`}
              key={station.id}
              className={`station station-${station.color} ${
                isCurrent ? "current-station" : ""
              } ${isPast ? "past-station" : ""}`}
              style={{
                left: `${adjustedPosition.x}%`,
                top: `${adjustedPosition.y}%`,
                width: `3.2rem`,
                height: `3.2rem`,
              }}
            >
              <div className="station-icon-container">
                <div className="station-icon">{station.icon}</div>
              </div>
              {isCurrent && (
                <>
                  <div className="station-glow"></div>
                  <div className="station-marker"></div>
                  <div className="station-pulse"></div>
                </>
              )}
              <div
                className={`station-name ${
                  isCurrent ? "station-name-current" : ""
                } ${nameOnTop ? "station-name-top" : ""}`}
              >
                תחנה מספר {station.id}
              </div>
            </div>
          );
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
  );
}
