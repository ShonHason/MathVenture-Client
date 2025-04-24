import React, { useState, useEffect, FormEvent } from "react";
import { useParams } from "react-router-dom";

type Message = { role: "system" | "user" | "assistant"; content: string };

export default function LessonDetail() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 1) load session
  useEffect(() => {
    if (!lessonId) return;
    fetch(`/lessons/${lessonId}/session`)
      .then((r) => r.json())
      .then(({ messages }) => setMessages(messages))
      .catch(console.error);
  }, [lessonId]);

  // 2) send user question
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !lessonId) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      // chat
      const res = await fetch(`/lessons/${lessonId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const { answer } = await res.json();
      const botMsg: Message = { role: "assistant", content: answer };
      setMessages((m) => [...m, botMsg]);

      // optional: speak it
      const ttsRes = await fetch(`/lessons/${lessonId}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: answer }),
      });
      const audioBlob = await ttsRes.blob();
      const url = URL.createObjectURL(audioBlob);
      new Audio(url).play();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Lesson {lessonId}</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          height: "60vh",
          overflowY: "auto",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.role === "assistant" ? "left" : "right",
              margin: "8px 0",
            }}
          >
            <strong>
              {m.role === "assistant"
                ? "מורה"
                : m.role === "user"
                ? "תלמיד"
                : ""}
              :
            </strong>{" "}
            {m.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="הקלד תשובה…"
          style={{ width: "80%", padding: 8 }}
        />
        <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
          שלח
        </button>
      </form>
    </div>
  );
}
