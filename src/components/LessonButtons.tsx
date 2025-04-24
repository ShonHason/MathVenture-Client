import React from "react";
import "./LessonButtons.css";

interface LessonButtonsProps {
  onActionPerformed?: (action: string) => void;
}

const LessonButtons: React.FC<LessonButtonsProps> = ({ onActionPerformed }) => {
  const handleButtonClick = (action: string) => {
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
    <div className="button-container">
      <button className="button" onClick={() => handleButtonClick("pause")}>
        הפסקה
      </button>
      <button
        className="button"
        onClick={() => handleButtonClick("explanation")}
      >
        הסבר נוסף
      </button>
      <button
        className="button black-button"
        onClick={() => handleButtonClick("slow")}
      >
        לאט יותר
      </button>
      <button
        className="button"
        onClick={() => handleButtonClick("end-lesson")}
      >
        סיים שיעור
      </button>
    </div>
  );
};

export default LessonButtons;
