import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./StartLessons.css";
import LessonsContext, { Topic } from "../context/LessonsContext";

const StartLessons: React.FC = () => {
  const lessonsContext = useContext(LessonsContext);
  const navigate = useNavigate();

  if (!lessonsContext) return null;

  const { topics } = lessonsContext;

  const handleStartLesson = (topic: Topic) => {
    console.log("Starting lesson:", topic);
    navigate(`/home/start-lessons/${encodeURIComponent(topic.subject)}`, {
      state: { topic },
    });
    // שליחה לניווט או שמירה ב-localStorage
  };

  return (
    <div className="start-lessons-container">
      <p className="section-title">:התחל שיעור</p>

      <div className={`lesson-topics ${topics.length === 0 ? "empty" : ""}`}>
        {topics.length === 0 ? (
          <p>אין נושאים זמינים</p>
        ) : (
          topics.map((topic, index) => (
            <div key={index} className="topic-item">
              {topic.subject} - כיתה {topic.grade} - רמה {topic.rank}
              <button
                className="add-topic-button"
                onClick={() => handleStartLesson(topic)}
              >
                התחל
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StartLessons;
