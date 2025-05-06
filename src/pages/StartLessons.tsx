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
    navigate(
      `/home/start-lessons/${encodeURIComponent(topic.subject)}`, 
      {
        state: {
          topic,
          LesId: null, 
        },
      }
    );
  };

  return (
    <div className="start-lessons-container">
      <p className="section-title">התחל שיעור</p>
      <div className={`lesson-topics ${topics.length === 0 ? "empty" : ""}`}>
        {topics.length === 0 ? (
          <p>אין נושאים זמינים</p>
        ) : (
          topics.map((topic, idx) => (
            <div key={idx} className="topic-item">
              <div className="topic-info">
                <span className="topic-subject">{topic.subject}</span>
                <span className="topic-grade">כיתה {topic.grade}</span>
              </div>
              <button
                className="start-btn"
                onClick={() => handleStartLesson(topic)}
              >
                התחל שיעור
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StartLessons;
