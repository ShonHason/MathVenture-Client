import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { FaBookOpen } from "react-icons/fa";
import "./StartLessons.css";

const StartLessons: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const subjectsList = user?.subjectsList || [];
  const grade        = user?.grade        || "";

  const handleStartLesson = (subject: string) => {
    navigate(
      `/start-lessons/${encodeURIComponent(subject)}`,
      { state: { topic: { subject, question: "" }, lessonId: null } }
    );
  };

  return (
    <div className="start-lessons-box">
      <div className="start-lessons-container">
        {/* עכשיו כותרת + הרשימה עטופים ביחד */}
        <div className="lesson-board">
          <p className="section-title">התחל שיעור</p>
          <div className={`lesson-topics ${subjectsList.length === 0 ? "empty" : ""}`}>
            {subjectsList.length === 0 ? (
              <p>אין נושאים זמינים כרגע</p>
            ) : (
              subjectsList.map((subject: string, idx: number) => (
                <div key={idx} className="topic-item">
                  <div className="topic-info">
                    <span className="topic-subject">
                      <FaBookOpen className="icon" /> {subject}
                    </span>
                    {grade && <span className="topic-grade">כיתה {grade}</span>}
                  </div>
                  <button
                    className="start-btn"
                    onClick={() => handleStartLesson(subject)}
                  >
                    🚀 התחלה!
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        {/* /lesson-board */}
      </div>
    </div>
  );
};

export default StartLessons;
