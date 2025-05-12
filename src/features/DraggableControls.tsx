import React, { useRef, useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  faGripHorizontal,
  faGripVertical,
  faGripLines,
  faHandRock,
  faHandPaper,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./DraggableControls.css"; // Import your CSS file
interface Props {
  children: React.ReactNode;
  position: { x: number; y: number };
  isPinned: boolean;
}

const DraggableControls: React.FC<Props> = ({
  children,
  position,
  isPinned,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: "audio-controls",
    });

  const containerRef = useRef<HTMLDivElement>(null);
  const [wasDragged, setWasDragged] = useState(false);

  useEffect(() => {
    if (isDragging) {
      setWasDragged(true);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isPinned) {
      setWasDragged(false);
    }
  }, [isPinned]);

  const fixedStyle: React.CSSProperties = {
    position: "fixed",
    top: position.y + (transform?.y || 0),
    left: position.x + (transform?.x || 0),
    zIndex: 9999,
    userSelect: "none",
    width: "fit-content",
  };

  const relativeStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: "96.65%",
    transform: "translateX(-50%)",
    userSelect: "none",
    width: "fit-content",
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        containerRef.current = node;
      }}
      style={wasDragged ? fixedStyle : relativeStyle}
      {...attributes}
    >
      <div
        {...listeners}
        style={{
          position: "absolute",
          top: 0,
          left: -5,
          padding: "0px",
          cursor: "grab",
          zIndex: 1000,
          overflow: "visible",
        }}
      >
        <FontAwesomeIcon className="aa" icon={faHandPaper} />
      </div>
      {children}
    </div>
  );
};

export default DraggableControls;
