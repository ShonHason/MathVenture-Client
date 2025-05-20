// src/features/MyLessons.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./MyLessons.css";
// import LoaderVideo from "../../public/Loader.mp4";
const LoaderVideo = process.env.PUBLIC_URL + "/Loader.mp4";
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
  const handleReport = (lesson: Lesson) => {
    const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
    try {
      axios.post(`${baseUrl}/lessons/report/${lesson._id}`);
      const email = localStorage.getItem("parent_email");
      if (!email) {
        alert("לא נמצאה כתובת מייל של ההורים");
        return;
      }

      alert("הדוח נשלח בהצלחה לכתובת מייל ההורים");
    } catch (error) {
      console.error("Error sending report:", error);
      alert("שגיאה בשליחת הדוח");
    }
  };
  const handleDelete = async (lessonId: string) => {
    const baseUrl = process.env.SERVER_API_URL || "http://localhost:4000";
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את השיעור?")) return;
    try {
      await axios.delete(`${baseUrl}/lessons/${lessonId}`);
      setLessons((prevLessons) =>
        prevLessons.filter((lesson) => lesson._id !== lessonId)
      );
      alert("השיעור נמחק בהצלחה");
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("שגיאה במחיקת השיעור");
    }
  };

  // Loader video import

  const Loader: React.FC = () => (
    <div className="ml-loading">
      <video src={LoaderVideo} autoPlay loop muted width={120} height={120} />
    </div>
  );

  if (loading) return <Loader />;
  // if (loading) return <div className="ml-loading">טוען…</div>;
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
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((l) => (
            <tr key={l._id}>
              <td className="ml-id-cell">{l._id}</td>
              <td>{l.subject}</td>
              <td>{formatDate(l.startTime)}</td>
              {/* Single TD for all buttons */}
              <td className="ml-actions">
                <button
                  className="status-btn"
                  disabled={l.progress === "COMPLETED"}
                  onClick={() => handleStatusClick(l)}
                >
                  {statusLabels[l.progress]}
                </button>

                <button className="report-btn" onClick={() => handleReport(l)}>
                  הפק דו"ח
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(l._id)}
                >
                  מחק
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
