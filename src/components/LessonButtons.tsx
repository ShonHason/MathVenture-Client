import React from 'react';
import './LessonButtons.css';

interface LessonButtonsProps {
  onActionPerformed?: (action: string) => void;
}

const LessonButtons: React.FC<LessonButtonsProps> = ({ onActionPerformed }) => {
  const handleButtonClick = (action: string) => {
    // טיפול מקומי בלחיצה על כפתור
    switch (action) {
      case 'time-out':
        console.log('הפסקה');
        break;
      case 'explanation':
        console.log('הסבר נוסף');
        break;
      case 'slow':
        console.log('הסבר איטי יותר');
        break;
      case 'scan':
        console.log('סורק את הלוח');
        openScanner();
        break;
      case 'clean':
        console.log('ניקוי הלוח');
        break;
      case 'end-lesson':
        console.log('סיימת את השיעור');
        break;
      default:
        console.log('פעולה לא מוכרת');
    }
    
    // העברת הפעולה לקומפוננטת האב אם נדרש
    if (onActionPerformed) {
      onActionPerformed(action);
    }
  };

  const openScanner = () => {
    // כאן יוכל להיות הקוד שפותח את אפשרות העלאת תמונה או סריקה עם המצלמה
    console.log('הסריקה החלה!');
  };

  return (
    <div className="button-container">
      <button className="button" onClick={() => handleButtonClick('time-out')}>
        הפסקה
      </button>
      <button className="button" onClick={() => handleButtonClick('explanation')}>
        הסבר נוסף
      </button>
      <button className="button black-button" onClick={() => handleButtonClick('slow')}>
        לאט יותר
      </button>
      <button className="button" onClick={() => handleButtonClick('scan')}>
        לסריקת הלוח
      </button>
      <button className="button" onClick={() => handleButtonClick('clean')}>
        ניקוי לוח
      </button>
      <button className="button" onClick={() => handleButtonClick('end-lesson')}>
        סיים שיעור
      </button>
    </div>
  );
};

export default LessonButtons;