// src/features/MyLessons.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyLessons.css";

interface Lesson {
  _id: string;
  subject: string;
  grade: string;
  startTime: string;
  progress: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

const statusLabels: Record<Lesson["progress"], string> = {
  NOT_STARTED: "התחל",
  IN_PROGRESS: "המשך",
  COMPLETED: "הושלם",
};

export const MyLessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  // 1. קריאה לשרת כדי להביא את השיעורים
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("משתמש לא מחובר");
      setLoading(false);
      return;
    }
    const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
    axios
      .get<Lesson[]>(`${baseUrl}/lessons/getLessons/${userId}`)
      .then((resp) => setLessons(resp.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError("אין שיעורים פעילים");
        } else {
          setError("שגיאה בטעינת השיעורים");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // 2. עיצוב תאריך
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // 3. הפונקציה לטיפול בלחיצה על כפתור סטטוס
  const handleStatusClick = (_id: string, isDone: boolean , subject : string) => {
    if (!isDone) {
      console.log(_id);
      navigate(
        `/lessons/`, 
        { state: { topic: {question : 1+1 , subject : subject}} }
      );
    }
  };

  if (loading) return <div className="ml-loading">טוען…</div>;
  if (error) return <div className="ml-error">{error}</div>;
  if (lessons.length === 0) return <div className="ml-none">אין שיעורים פעילים כרגע</div>;

  return (
    <div className="ml-container">
      <h2 className="ml-title">השיעורים שלי</h2>
      <table className="ml-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>נושא</th>
            <th>תאריך התחלה</th>
            <th>סטטוס</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((l) => {
            const isDone = l.progress === "COMPLETED";
            return (
              <tr key={l._id}>
                <td className="ml-id-cell">{l._id}</td>
                <td>{l.subject}</td>
                <td>{formatDate(l.startTime)}</td>
                <td>
                  <button
                    className="status-btn"
                    disabled={isDone}
                    onClick={() => handleStatusClick(l._id, isDone, l.subject)}
                  >
                    {statusLabels[l.progress]}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MyLessons;
