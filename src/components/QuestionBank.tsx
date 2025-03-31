import React from 'react';
import { Radio } from 'antd';

export interface QuestionItem {
  label: string;
  name: string;
  inputType: React.ReactNode;
  minGrade?: string;
  maxGrade?: string;
  forSubjects?: string[];
}

// בנק שאלות מותאם לפי גיל ונושא - גרסה מצומצמת
export const allQuestions: QuestionItem[] = [
  // שאלות לכיתה א'-ב'
  {
    label: "איך הילד מסתדר עם חיבור של מספרים עד 10?",
    name: "additionToTen",
    minGrade: "א",
    maxGrade: "ב",
    forSubjects: ['חיבור עד 10', 'הכרת מספרים מ-1 עד 10'],
    inputType: (
      <Radio.Group>
        {[
          { label: "מתקשה מאוד", value: 1 },
          { label: "מתמודד עם קשיים", value: 2 },
          { label: "סביר", value: 3 },
          { label: "טוב", value: 4 },
          { label: "מצוין", value: 5 },
        ].map((option) => (
          <Radio value={option.value} key={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    ),
  },
  {
    label: "האם הילד מכיר צורות גיאומטריות בסיסיות (עיגול, משולש, ריבוע)?",
    name: "basicShapes",
    minGrade: "א",
    maxGrade: "ג",
    forSubjects: ['זיהוי צורות גיאומטריות בסיסיות', 'צורות תלת-ממדיות פשוטות'],
    inputType: (
      <Radio.Group>
        {[
          { label: "מכיר מעט מאוד", value: 1 },
          { label: "מכיר חלק", value: 3 },
          { label: "מכיר היטב", value: 5 },
        ].map((option) => (
          <Radio value={option.value} key={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    ),
  },
  {
    label: "האם הילד מבין את המושגים 'גדול יותר', 'קטן יותר', 'שווה'?",
    name: "comparisons",
    minGrade: "א",
    maxGrade: "ב",
    forSubjects: ['הכרת מושגים: גדול/קטן/שווה', 'השוואת כמויות'],
    inputType: (
      <Radio.Group>
        {[
          { label: "לא מבין", value: 1 },
          { label: "מבין חלקית", value: 3 },
          { label: "מבין היטב", value: 5 },
        ].map((option) => (
          <Radio value={option.value} key={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    ),
  },
  
  // שאלות לכיתות ב'-ד'
  {
    label: "איך הילד מסתדר עם חיבור וחיסור של מספרים גדולים יותר?",
    name: "addSubtractLarger",
    minGrade: "ב",
    maxGrade: "ד",
    forSubjects: ['חיבור עד 100', 'חיסור עד 100', 'חיבור וחיסור עד 1000'],
    inputType: (
      <Radio.Group>
        {[1, 2, 3, 4, 5].map((num) => (
          <Radio value={num} key={num}>
            {num}
          </Radio>
        ))}
      </Radio.Group>
    ),
  },
  {
    label: "איך הילד מסתדר עם לוח הכפל?",
    name: "multiplicationTable",
    minGrade: "ב",
    maxGrade: "ד",
    forSubjects: ['כפל פשוט', 'לוח הכפל עד 5', 'לוח הכפל עד 10', 'כפל במספרים גדולים'],
    inputType: (
      <Radio.Group>
        {[1, 2, 3, 4, 5].map((num) => (
          <Radio value={num} key={num}>
            {num}
          </Radio>
        ))}
      </Radio.Group>
    ),
  },
  {
    label: "האם הילד מבין את מושג הזמן (שעון, יום, שבוע, חודש)?",
    name: "timeConcept",
    minGrade: "ב",
    maxGrade: "ד",
    forSubjects: ['מדידת זמן', 'קריאת שעון'],
    inputType: (
      <Radio.Group>
        {[
          { label: "מתקשה מאוד", value: 1 },
          { label: "מבין חלקית", value: 3 },
          { label: "מבין היטב", value: 5 },
        ].map((option) => (
          <Radio value={option.value} key={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    ),
  },
  
  // שאלות לכיתות ד'-ו'
  {
    label: "איך הילד מבין שברים?",
    name: "fractions",
    minGrade: "ג",
    maxGrade: "ז",
    forSubjects: ['שברים פשוטים', 'שברים שווי ערך', 'שברים', 'שברים עשרוניים', 'המרה בין שברים פשוטים לעשרוניים'],
    inputType: (
      <Radio.Group>
        {[1, 2, 3, 4, 5].map((num) => (
          <Radio value={num} key={num}>
            {num}
          </Radio>
        ))}
      </Radio.Group>
    ),
  },
  {
    label: "איך הילד מבין ומזהה זוויות שונות (ישרה, חדה, קהה)?",
    name: "angleRecognition",
    minGrade: "ד",
    maxGrade: "ו",
    forSubjects: ['זוויות', 'מדידות של זוויות', 'גיאומטריה במישור'],
    inputType: (
      <Radio.Group>
        {[
          { label: "לא מזהה כלל", value: 1 },
          { label: "מזהה חלק מהזוויות", value: 3 },
          { label: "מזהה ומבין היטב", value: 5 },
        ].map((option) => (
          <Radio value={option.value} key={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    ),
  },
  {
    label: "איך הילד מתמודד עם מספרים שליליים?",
    name: "negativeNumbers",
    minGrade: "ה",
    maxGrade: "ז",
    forSubjects: ['מספרים שליליים בסיסיים', 'מספרים שליליים וחיוביים'],
    inputType: (
      <Radio.Group>
        {[
          { label: "לא מכיר או מתקשה מאוד", value: 1 },
          { label: "מבין את המושג אבל מתקשה בפעולות", value: 3 },
          { label: "שולט בחומר", value: 5 },
        ].map((option) => (
          <Radio value={option.value} key={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    ),
  },
  
  // שאלות לכיתות ז'-ט'
  {
    label: "איך הילד מסתדר עם אלגברה בסיסית?",
    name: "basicAlgebra",
    minGrade: "ז",
    maxGrade: "ט",
    forSubjects: ['אלגברה בסיסית', 'ביטויים אלגבריים', 'משוואות קוויות'],
    inputType: (
      <Radio.Group>
        {[1, 2, 3, 4, 5].map((num) => (
          <Radio value={num} key={num}>
            {num}
          </Radio>
        ))}
      </Radio.Group>
    ),
  },
  {
    label: "איך הילד מסתדר עם גיאומטריה מתקדמת?",
    name: "advancedGeometry",
    minGrade: "ז",
    maxGrade: "ט",
    forSubjects: ['גאומטריה במרחב', 'תכונות משולשים ומרובעים', 'משפט פיתגורס'],
    inputType: (
      <Radio.Group>
        {[1, 2, 3, 4, 5].map((num) => (
          <Radio value={num} key={num}>
            {num}
          </Radio>
        ))}
      </Radio.Group>
    ),
  },
  
  // שאלות כלליות להתנהגות למידה - מתאימות לכל הגילאים
  {
    label: "האם הילד מבצע שיעורי בית באופן עצמאי?",
    name: "homework",
    inputType: (
      <Radio.Group>
        {[
          { label: "תמיד צריך עזרה", value: 1 },
          { label: "לפעמים צריך עזרה", value: 3 },
          { label: "עצמאי לגמרי", value: 5 },
        ].map((option) => (
          <Radio value={option.value} key={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    ),
  },
  {
    label: "איך הילד מגיב כשצריך ללמוד נושא חדש במתמטיקה?",
    name: "newTopic",
    inputType: (
      <Radio.Group>
        {[
          { label: "חרדה ותסכול", value: 1 },
          { label: "סבירה", value: 3 },
          { label: "התלהבות ועניין", value: 5 },
        ].map((option) => (
          <Radio value={option.value} key={option.value}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    ),
  }
];

export default allQuestions;