// src/pages/StartLessons.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessons, Topic } from '../context/LessonsContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const StartLessons: React.FC = () => {
  const { topics, setTopics } = useLessons();
  const navigate = useNavigate();

  // Fetch fresh list of lessons for this user
  const refreshTopics = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
      const res = await fetch(`${API_URL}/lessons/users/${userId}`);
      if (!res.ok) throw new Error();
      const data: Topic[] = await res.json();
      setTopics(data);
    } catch {
      console.error('Failed to refresh lessons');
    }
  };

  // On mount, load existing lessons
  useEffect(() => {
    refreshTopics();
  }, []);

  const launch = async (topic: Topic) => {
    // If it already has an _id, resume
    if (topic._id) {
      navigate(`/lessons/${topic._id}`, { state: { topic } });
      return;
    }

    // Otherwise start a fresh one
    try {
      const res = await fetch(`${API_URL}/lessons/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          subject: topic.subject,
          username: localStorage.getItem('username'),
          grade: topic.grade,
          rank: topic.rank,
        }),
      });
      if (!res.ok) throw new Error();
      const lesson = await res.json();
      await refreshTopics();
      navigate(`/lessons/${lesson._id}`, {
        state: { topic: { ...topic, _id: lesson._id } },
      });
    } catch {
      alert('התחלת השיעור נכשלה');
    }
  };

  return (
    <div className="start-lessons-container">
      <h2>שיעורים קיימים / התחלת שיעור חדש</h2>
      {topics.map((t) => (
        <div key={t._id ?? t.subject} className="topic-item">
          <span>
            {t.subject} - כיתה {t.grade} - רמה {t.rank}
          </span>
          <button onClick={() => launch(t)}>
            {t._id ? 'המשך שיעור' : 'התחל שיעור'}
          </button>
        </div>
      ))}
      {topics.length === 0 && <p>אין שיעורים קיימים.</p>}
    </div>
  );
};

export default StartLessons;
