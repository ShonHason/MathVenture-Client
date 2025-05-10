// src/components/MathKeypad.tsx
import React from "react";
import "./MathKeypad.css";

interface MathKeypadProps {
  onPress: (key: string) => void;
}

const keys = [
  "7",
  "8",
  "9",
  "/",
  "4",
  "5",
  "6",
  "*",
  "1",
  "2",
  "3",
  "-",
  "0",
  ".",
  "=",
  "+",
];

const MathKeypad: React.FC<MathKeypadProps> = ({ onPress }) => (
  <div className="math-keypad">
    {keys.map((k) => (
      <button
        key={k}
        className={`key ${isNaN(Number(k)) && k !== "." ? "op" : ""}`}
        onClick={() => onPress(k)}
      >
        {k}
      </button>
    ))}
  </div>
);

export default MathKeypad;
