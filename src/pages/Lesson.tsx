// src/pages/Lesson.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Transcript from "../components/Transcript";
import "./Lesson.css";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const Lesson: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [subject, setSubject]   = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading]   = useState<boolean>(true);

  useEffect(() => {
    if (!lessonId) return;
    fetch(`${process.env.REACT_APP_API_URL || ""}/lessons/${lessonId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load lesson");
        return res.json();
      })
      .then(data => {
        setSubject(data.subject);
        setMessages(data.messages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) return <p>טוען שיעור…</p>;
  if (!lessonId) return <p>לא נמצא מזהה שיעור.</p>;

  return (
    <div className="lesson-container">
      <button className="back-button"
        onClick={() => navigate("/home/lessons")}>
        ← חזרה
      </button>
      <h2>{subject}</h2>
      <div className="messages">
        {messages.map((msg, idx) => (
          <Transcript
            key={idx}
            text={
              msg.role === "user"
                ? `אתה: ${msg.content}`
                : msg.role === "assistant"
                ? `מדריך: ${msg.content}`
                : msg.content
            }
          />
        ))}
      </div>
    </div>
  );
};

export default Lesson;
