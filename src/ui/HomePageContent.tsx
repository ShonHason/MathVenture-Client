// src/ui/HomePageContent.tsx
import React, { useState } from 'react';
import { useLessons, Topic } from '../context/LessonsContext';
import subjectsByGrade from '../components/SubjectByGrade';
import './HomePageContent.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const HomePageContent: React.FC = () => {
  const { topics, setTopics } = useLessons();
  const [showModal, setShowModal] = useState(false);
  const [chosenSubject, setChosenSubject] = useState('');
  const [chosenRank, setChosenRank] = useState(1);

  // your student's grade from localStorage
  const grade = localStorage.getItem('grade') || 'א';

  const addLesson = async () => {
    if (!chosenSubject) {
      alert('בחר נושא');
      return;
    }
    try {
      const userId = localStorage.getItem('userId')!;
      const username = localStorage.getItem('username')!;
      const res = await fetch(`${API_URL}/lessons/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subject: chosenSubject,
          username,
          grade,
          rank: chosenRank,
        }),
      });
      if (!res.ok) throw new Error();
      const lesson: Topic & { _id: string } = await res.json();

      // append the newly created lesson (with its _id) to our list
      setTopics([...topics, {
        _id: lesson._id,
        subject: lesson.subject,
        grade,
        rank: chosenRank,
      }]);

      // reset UI
      setShowModal(false);
      setChosenSubject('');
      setChosenRank(1);
    } catch (err) {
      console.error(err);
      alert('לא הצלחנו להתחיל שיעור');
    }
  };

  return (
    <div className="homepage-content">
      <h2>השיעורים שלי</h2>

      {topics.length === 0 ? (
        <p>אין שיעורים</p>
      ) : (
        topics.map((t) => (
          <div key={t._id || t.subject} className="lesson-item">
            {t.subject} – כיתה {t.grade} – רמה {t.rank}
          </div>
        ))
      )}

      <button onClick={() => setShowModal(true)}>הוסף שיעור</button>

      {showModal && (
        <div className="modal">
          <select
            value={chosenSubject}
            onChange={(e) => setChosenSubject(e.target.value)}
          >
            <option value="">בחר נושא</option>
            {subjectsByGrade[grade].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={chosenRank}
            onChange={(e) => setChosenRank(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                רמה {r}
              </option>
            ))}
          </select>

          <button onClick={addLesson}>אישור</button>
          <button onClick={() => setShowModal(false)}>ביטול</button>
        </div>
      )}
    </div>
  );
};

export default HomePageContent;
