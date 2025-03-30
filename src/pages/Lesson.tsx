import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Topic } from "../context/LessonsContext";
import "./Lesson.css";
import { useNavigate } from "react-router-dom";

const Lesson: React.FC = () => {
  const { topicName } = useParams();
  const location = useLocation();
  const topic = (location.state as { topic: Topic })?.topic;
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/home/start-lessons");
  };
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!topic) return <p>לא נמצא נושא: {topicName}</p>;

  const currentQuestion = topic.questions[currentIndex];
  const progress = ((currentIndex + 1) / topic.questions.length) * 100;

  return (
    <div className="lesson-container">
      <h2>{topic.subject}</h2>
      <p>כיתה: {topic.grade}</p>
      <p>רמת קושי: {topic.rank}</p>
      <button className="back-button" onClick={handleBack}>
        ⬅ חזרה
      </button>

      {/* Progress bar */}
      <div className="progress-bar-wrapper">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      {/* שאלה נוכחית */}
      <div className="questions-section">
        <div className="question-card">
          <div className="question">{currentQuestion.question}</div>
          <div className="options">
            {currentQuestion.options.map((opt, idx) => (
              <button key={idx} className="option-button">
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* כפתורי ניווט */}
        <div className="navigation-buttons">
          <button
            className="nav-button"
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            disabled={currentIndex === 0}
          >
            הקודם
          </button>
          <button
            className="nav-button"
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            disabled={currentIndex === topic.questions.length - 1}
          >
            הבא
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
