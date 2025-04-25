import React from "react";
import "./LessonButtons.css";

interface LessonButtonsProps {
  onActionPerformed?: (action: string) => void;
  disabled?: boolean;
}

const LessonButtons: React.FC<LessonButtonsProps> = ({
  onActionPerformed,
  disabled = false,
}) => {
  const handleButtonClick = (action: string) => {
    if (disabled) return;

    switch (action) {
      case "pause":
        console.log("הפסקה");
        break;
      case "explanation":
        console.log("הסבר נוסף");
        break;
      case "slow":
        console.log("הסבר איטי יותר");
        break;
      case "end-lesson":
        console.log("סיימת את השיעור");
        break;
      default:
        console.log("פעולה לא מוכרת");
    }

    if (onActionPerformed) {
      onActionPerformed(action);
    }
  };

  return (
    <div className={`button-container ${disabled ? "disabled" : ""}`}>
      <button
        className="button"
        onClick={() => handleButtonClick("pause")}
        disabled={disabled}
      >
        הפסקה
      </button>
      <button
        className="button"
        onClick={() => handleButtonClick("explanation")}
        disabled={disabled}
      >
        הסבר נוסף
      </button>
      <button
        className="button black-button"
        onClick={() => handleButtonClick("slow")}
        disabled={disabled}
      >
        לאט יותר
      </button>
      <button
        className="button"
        onClick={() => handleButtonClick("end-lesson")}
        disabled={disabled}
      >
        סיים שיעור
      </button>
    </div>
  );
};

export default LessonButtons;
