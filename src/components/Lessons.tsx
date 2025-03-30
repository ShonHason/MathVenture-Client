import React, { useContext } from "react";
import "./Lessons.css";
import LessonsContext from "../context/LessonsContext";

const Lessons: React.FC = () => {
  const lessonsContext = useContext(LessonsContext);

  if (!lessonsContext) return null;

  const { topics } = lessonsContext;

  return (
    <div className="lessons-container">
      <div className="lessons-header">
        <span>נושא השיעור</span>
        <span>כיתה</span>
        <span>רמת קושי</span>
        <span>פעולה</span>
      </div>
      {topics.length > 0 ? (
        topics.map((topic, index) => (
          <div key={index} className="lessons-row">
            <span>{topic.subject}</span>
            <span>{topic.grade}</span>
            <span>{topic.rank}</span>
            <button className="lessons-action-button">צפייה</button>
          </div>
        ))
      ) : (
        <div className="lessons-row">
          <span>אין נושאים זמינים</span>
        </div>
      )}
    </div>
  );
};

export default Lessons;
