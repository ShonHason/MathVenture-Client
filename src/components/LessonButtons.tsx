// src/components/LessonButtons.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessons } from '../context/LessonsContext';
import './LessonButtons.css';

interface LessonButtonsProps {
  lessonId: string;
}

const LessonButtons: React.FC<LessonButtonsProps> = ({ lessonId }) => {
  const navigate = useNavigate();
  const { setTopics } = useLessons();

  // Base URL of your backend (adjust or move to env)
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

  const handleFinishLesson = async () => {
    try {
      // 1) Update lesson endTime on the server
      const patchRes = await fetch(
        `${API_BASE}/lessons/${lessonId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endTime: new Date().toISOString() }),
        }
      );
      if (!patchRes.ok) {
        throw new Error(`Server responded ${patchRes.status}`);
      }

      // 2) Refresh the user's lessons list
      const userId = localStorage.getItem('userId');
      if (userId) {
        const listRes = await fetch(`${API_BASE}/lessons/users/${userId}`);
        if (!listRes.ok) throw new Error(`Fetch lessons failed: ${listRes.status}`);
        const updatedLessons = await listRes.json();
        setTopics(updatedLessons);
      }

      // 3) Navigate back to lessons overview
      navigate('/home/lessons');
    } catch (err) {
      console.error('Error finishing lesson:', err);
      alert('לא הצלחנו לסיים את השיעור. נסה שוב.');
    }
  };

  return (
    <div className="button-container">
      <button className="button" onClick={() => navigate(-1)}>
        הפסקה
      </button>
      <button className="button" onClick={() => alert('הסבר נוסף...')}>
        הסבר נוסף
      </button>
      <button className="button black-button" onClick={() => alert('למד לאט יותר...')}>
        לאט יותר
      </button>
      <button className="button" onClick={handleFinishLesson}>
        סיים שיעור
      </button>
    </div>
  );
};

export default LessonButtons;
