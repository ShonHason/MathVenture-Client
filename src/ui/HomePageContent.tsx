import React, { useContext, useEffect, useState } from "react";
import "./HomePageContent.css";
import LessonsContext, { Topic, Question } from "../context/LessonsContext";
import { subjectsByGrade } from "../components/SubjectByGrade";
import { useUser } from "../context/UserContext";

export const generateTopic = (
  subject: string,
  grade: string,
  rank: number
): Topic => {
  const dummyQuestions: Question[] = [];
  for (let i = 1; i <= 3; i++) {
    dummyQuestions.push({
      question: `(${grade}, רמה ${rank}) מהי התוצאה של ${i * rank} + ${rank}?`,
      options: [
        `${i * rank + rank}`,
        `${i * rank + rank + 1}`,
        `${i * rank + rank - 1}`,
        `${i * rank}`,
      ],
      correctAnswer: `${i * rank + rank}`,
    });
  }

  return {
    subject,
    grade,
    rank,
    questions: dummyQuestions,
  };
};

const HomePageContent: React.FC = () => {
  const { user } = useUser();
  const lessonsContext = useContext(LessonsContext);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState(false);
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
    if (selectedSubject) {
      const newTopic = generateTopic(selectedSubject, grade, selectedRank);
      setTopics([...topics, newTopic]);
      setSelectedSubject("");
      setSelectedRank(1);
      setShowAddModal(false);
    }
  };

  return (
    <div className="homepage-content">
      <p className="section-title">:השיעורים שלי</p>
      <div className={`my-lessons ${topics.length === 0 ? "empty" : ""}`}>
        {topics.length === 0 ? (
          <p>כרגע אין שיעורים</p>
        ) : (
          topics.map((topic, index) => (
            <div key={index} className="lesson-item">
              {topic.subject} - כיתה {topic.grade} - רמה {topic.rank}
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="add-topic-button"
      >
        להוספת נושא
      </button>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-topic-modal">
            <p className="modal-title">הוספת שיעור</p>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="topic-select"
            >
              <option value="">בחר נושא</option>
              {predefinedSubjects.map((subj, index) => (
                <option key={index} value={subj}>
                  {subj}
                </option>
              ))}
            </select>

            <select
              value={selectedRank}
              onChange={(e) => setSelectedRank(Number(e.target.value))}
              className="topic-select"
            >
              {[1, 2, 3, 4, 5].map((rank) => (
                <option key={rank} value={rank}>
                  רמת קושי {rank}
                </option>
              ))}
            </select>

            <div className="modal-buttons">
              <button onClick={handleAddTopic} className="add-topic-button">
                שמירה
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="cancel-button"
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
