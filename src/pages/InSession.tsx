import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import Avatar3D from "../components/Avatar3D";
import Transcript from "../components/Transcript";
import DrawableMathNotebook from "../components/DrawableMathNotebook";
import LessonButtons from "../components/LessonButtons";
import RealTimeRecorder from "../components/RealTimeRecorder";
import AudioUnlocker from "../components/AudioUnlocker";
import "./InSession.css";

const DIRECT_MODEL_URL =
  "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb";
const socketServerUrl =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const InSession: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [topic, setTopic] = useState<{ subject: string; question?: string }>({
    subject: "",
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [firstAsked, setFirstAsked] = useState(false);

  // Conversation states
  const [userTranscript, setUserTranscript] = useState("");
  const [aiTranscript, setAiTranscript] = useState("");
  const [processing, setProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("טוען שיעור…");

  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  // 1) Load the existing lesson
  useEffect(() => {
    if (!lessonId) return;
    axios
      .get(`${socketServerUrl}/lessons/${lessonId}`)
      .then((res) => {
        const lesson = res.data;
        setTopic({ subject: lesson.subject });
        setMessages(lesson.messages || []);
        setHasLoaded(true);
        setStatus("מוכן");
      })
      .catch((err) => {
        console.error(err);
        setStatus("שגיאה בטעינת השיעור");
      });
  }, [lessonId]);

  // 2) Once loaded, ask the first question exactly once
  useEffect(() => {
    if (hasLoaded && !firstAsked) {
      setFirstAsked(true);
      setStatus("שולח את השאלה הראשונה…");
      processTranscript("השאלה הראשונה");
    }
  }, [hasLoaded, firstAsked]);

  // 3) Silence-based user input trigger
  useEffect(() => {
    if (!hasLoaded || processing || !userTranscript.trim()) return;
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      setListening(false);
      processTranscript(userTranscript);
    }, 2500);
    return () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
    };
  }, [userTranscript, processing, hasLoaded]);

  // 4) Send user text into the chat + TTS pipeline
  const processTranscript = async (input: string) => {
    try {
      setProcessing(true);
      setStatus("מעבד את הבקשה שלך…");
      setUserTranscript("");

      const chatRes = await axios.post(
        `${socketServerUrl}/api/chat`,
        { question: input, lessonId },
        {
          headers: {
            Authorization: "jwt " + localStorage.getItem("accessToken"),
          },
        }
      );
      const aiText: string = chatRes.data.answer;
      setAiTranscript(aiText);
      setMessages((m) => [...m, { role: "assistant", content: aiText }]);

      // TTS
      setStatus("מדבר…");
      const ttsRes = await axios.post(
        `${socketServerUrl}/api/tts`,
        { text: aiText },
        { responseType: "arraybuffer" }
      );
      const audioBlob = new Blob([ttsRes.data], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setIsSpeaking(true);
      await audio.play();
      audio.onended = () => {
        setIsSpeaking(false);
        setListening(true);
        setProcessing(false);
        setStatus("מקשיב…");
      };
    } catch (err) {
      console.error(err);
      setStatus("שגיאה בעיבוד הטקסט");
      setProcessing(false);
    }
  };

  if (!hasLoaded) {
    return (
      <div className="in-session-page">
        <AudioUnlocker />
        <p>{status}</p>
      </div>
    );
  }

  return (
    <div className="in-session-page">
      <AudioUnlocker />
      <h2>נושא: {topic.subject}</h2>
      <div className="session-container">
        <div className="chat-area">
          <Avatar3D
            modelSrc={DIRECT_MODEL_URL}
            isSpeaking={isSpeaking}
            speech={aiTranscript || userTranscript}
            fallbackImageSrc="https://via.placeholder.com/300?text=Avatar"
          />
          <Transcript
            text={aiTranscript || userTranscript}
            isLoading={processing}
          />
          {listening && <RealTimeRecorder onTranscript={setUserTranscript} />}
        </div>

        <div className="lesson-buttons-area">
          <LessonButtons lessonId={lessonId!} />
        </div>

        <p className="status-display">סטטוס: {status}</p>

        <DrawableMathNotebook
          question={topic.question || ""}
          onRecognize={processTranscript}
        />
      </div>
    </div>
  );
};

export default InSession;
