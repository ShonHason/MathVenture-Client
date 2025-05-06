import React, { useContext, useEffect, useState } from "react";
import "./HomePageContent.css";
import LessonsContext, { Topic, Question } from "../context/LessonsContext";
import { subjectsByGrade } from "../components/SubjectByGrade";
import { useUser } from "../context/UserContext";

export const generateTopic = (
  subject: string,
  grade: string
): Topic => {
  const dummyQuestions: Question[] = [];
  for (let i = 1; i <= 3; i++) {
    dummyQuestions.push({
      question: `(${grade}) מהי התוצאה של ${i} + ${i}?`,
      options: [
        `${i + i}`,
        `${i + i + 1}`,
        `${i + i - 1}`,
        `${i}`,
      ],
      correctAnswer: `${i + i}`,
    });
  }

  return {
    subject,
    grade,
    rank: 1,         // דרג ברירת מחדל
    questions: dummyQuestions,
  };
};

const HomePageContent: React.FC = () => {
  const { user } = useUser();
  const lessonsContext = useContext(LessonsContext);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [predefinedSubjects, setPredefinedSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (user?.grade && subjectsByGrade[user.grade]) {
      setPredefinedSubjects(subjectsByGrade[user.grade]);
    }
  }, [user]);

  if (!lessonsContext) return null;
  const { topics, setTopics } = lessonsContext;

  const handleAddTopic = () => {
    const grade = user?.grade || "א'";
    if (!selectedSubject) return;
    const newTopic = generateTopic(selectedSubject, grade);
    setTopics([...topics, newTopic]);
    setSelectedSubject("");
    setShowAddModal(false);
  };

  return (
    <div className="homepage-content">
      <h2 className="hp-title">השיעורים שלי</h2>

      <div className={`my-lessons ${topics.length === 0 ? "empty" : ""}`}>
        {topics.length === 0 ? (
          <p className="empty-text">כרגע אין שיעורים</p>
        ) : (
          <div className="lessons-grid">
            {topics.map((topic, idx) => (
              <div key={idx} className="lesson-card">
                <div className="lesson-subject">{topic.subject}</div>
                <div className="lesson-meta">כיתה {topic.grade}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="add-topic-button"
        onClick={() => setShowAddModal(true)}
      >
        + הוסף שיעור חדש
      </button>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-topic-modal">
            <h3 className="modal-title">הוספת שיעור</h3>
            <select
              className="topic-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">בחר נושא</option>
              {predefinedSubjects.map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="modal-buttons">
              <button className="btn-save" onClick={handleAddTopic}>
                שמירה
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePageContent;
