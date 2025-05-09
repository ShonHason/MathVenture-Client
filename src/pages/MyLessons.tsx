// src/features/MyLessons.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
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
  const { user } = useUser();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout>;

    if (!user?._id) {
      // אם אין userId – נחכה 2 שניות לפני שנסמן שגיאה
      retryTimer = setTimeout(() => {
        if (!user?._id) {
          setError("משתמש לא מחובר");
          setLoading(false);
        }
      }, 2000);

      // ניקוי הטיימר בסיום
      return () => clearTimeout(retryTimer);
    }

    // אם יש userId, נטען את השיעורים
    const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
    axios
      .get<Lesson[]>(`${baseUrl}/lessons/getLessons/${user._id}`)
      .then((resp) => {
        setLessons(resp.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (err.response?.status === 404) {
          setError("אין שיעורים פעילים");
        } else {
          setError("שגיאה בטעינת השיעורים");
        }
      });

    // לא צריך ניקוי אחר כאן
  }, [user]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const handleStatusClick = (lesson: Lesson) => {
    if (lesson.progress !== "COMPLETED") {
      navigate(`/start-lessons/${encodeURIComponent(lesson.subject)}`, {
        state: {
          topic: { question: 1 + 1, subject: lesson.subject },
          lessonId: lesson._id,
        },
      });
    }
  };

  if (loading) return <div className="ml-loading">טוען…</div>;
  if (error) return <div className="ml-error">{error}</div>;
  if (lessons.length === 0)
    return <div className="ml-none">אין שיעורים פעילים כרגע</div>;

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
          {lessons.map((l) => (
            <tr key={l._id}>
              <td className="ml-id-cell">{l._id}</td>
              <td>{l.subject}</td>
              <td>{formatDate(l.startTime)}</td>
              <td>
                <button
                  className="status-btn"
                  disabled={l.progress === "COMPLETED"}
                  onClick={() => handleStatusClick(l)}
                >
                  {statusLabels[l.progress]}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyLessons;
