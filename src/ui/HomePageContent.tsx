import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext"; // Import useUser from UserContext
import { addSubject, removeSubject } from "../services/user_api"; // Import API calls
import { subjectsByGrade } from "../components/SubjectByGrade"; // Import subjectsByGrade
import "./HomePageContent.css";

const HomePageContent: React.FC = () => {
  const { user, setUser } = useUser(); // Access user data and setter from context
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [gradeSubjects, setGradeSubjects] = useState<string[]>([]);

  // Populate available subjects when user's grade changes
  useEffect(() => {
    if (user?.grade && subjectsByGrade[user.grade]) {
      setGradeSubjects(subjectsByGrade[user.grade]);
    }
  }, [user?.grade]);

  const handleAddTopic = async () => {
    if (!selectedSubject || !user?._id) return;
    try {
      await addSubject(user._id, selectedSubject);
      // Update user context directly
      const updatedSubjects = [...(user.subjectsList || []), selectedSubject];
      setUser({
        ...user,
        subjectsList: updatedSubjects,
      });
      setSelectedSubject("");
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  const handleDeleteTopic = async (subject: string) => {
    if (!user?._id) return;
    try {
      await removeSubject(user._id, subject);
      // Remove from context list
      const updatedSubjects = (user.subjectsList || []).filter(s => s !== subject);
      setUser({
        ...user,
        subjectsList: updatedSubjects,
      });
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const subjectsList = user?.subjectsList || [];

  return (
    <div className="homepage-content">
      <h2 className="hp-title">השיעורים שלי</h2>

      <div className={`my-lessons ${subjectsList.length === 0 ? "empty" : ""}`}>
        {subjectsList.length === 0 ? (
          <p className="empty-text">כרגע אין שיעורים</p>
        ) : (
          <div className="lessons-grid">
            {subjectsList.map((subject, idx) => (
              <div key={idx} className="lesson-card">
                <div className="lesson-subject">{subject}</div>
                <div className="lesson-meta">כיתה {user?.grade}</div>
                <button
                  className="delete-topic-button"
                  onClick={() => handleDeleteTopic(subject)}
                >
                  מחק
                </button>
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
              {gradeSubjects.length > 0 ? (
                gradeSubjects.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))
              ) : (
                <option disabled>אין נושאים זמינים לכיתה זו</option>
              )}
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