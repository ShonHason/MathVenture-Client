import React from "react";
import { useNavigate } from "react-router-dom";
import { useLessons } from "../context/LessonsContext";
import "./Lessons.css";

const Lessons: React.FC = () => {
  const { topics } = useLessons();
  const navigate = useNavigate();

  return (
    <div className="lessons-container">
      <div className="lessons-header">
        <span>נושא</span>
        <span>כיתה</span>
        <span>רמה</span>
        <span>פעולה</span>
      </div>

      {topics.length > 0 ? (
        topics.map((t) => (
          <div key={t._id} className="lessons-row">
            <span>{t.subject}</span>
            <span>{t.grade}</span>
            <span>{t.rank}</span>
            <button
              className="lessons-action-button"
              onClick={() => navigate(`/home/lessons/${t._id}`)}
            >
              המשך שיעור
            </button>
          </div>
        ))
      ) : (
        <div className="lessons-row">
          <span>אין שיעורים</span>
        </div>
      )}
    </div>
  );
};

export default Lessons;
