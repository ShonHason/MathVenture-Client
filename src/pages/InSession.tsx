// src/features/InSession.tsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Avatar3D from "../components/Avatar3D";
import Transcript from "../components/Transcript";
import DrawableMathNotebook from "../components/DrawableMathNotebook";
import LessonButtons from "../components/LessonButtons";
import RealTimeRecorder from "../components/RealTimeRecorder";
import AudioUnlocker from "../components/AudioUnlocker";
import { startLesson } from "../services/lessons_api"; // endLesson
import { useUser } from "../context/UserContext";
import "./InSession.css";

const DIRECT_MODEL_URL =
  "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb";
const socketServerUrl =
  process.env.SERVER_API_URL || "http://localhost:4000";

type LocationState = {
  state: {
    topic: { question: string; subject: string };
    lessonId?: string;
  };
};

const InSession: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { topic, lessonId: incomingId } = (useLocation() as LocationState)
    .state;
  const [lessonId, setLessonId] = useState<string>(incomingId || "");
  const [hasStarted, setHasStarted] = useState<boolean>(!!incomingId);

  const [userTranscript, setUserTranscript] = useState<string>("");
  const [aiTranscript, setAiTranscript] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [status, setStatus] = useState<string>(
    'לחץ "התחל שיחה" כדי לפתוח את השיחה'
  );
  const [listening, setListening] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // If there was a lessonId passed in, auto-start listening
  useEffect(() => {
    if (incomingId) {
      setHasStarted(true);
      setListening(true);
      setStatus("מקשיב...");
    }
  }, [incomingId]);

  // Debounce user transcript before sending
  useEffect(() => {
    if (!hasStarted || processing || !userTranscript.trim()) return;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      setListening(false);
      processTranscript(userTranscript);
    }, 2500);
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [userTranscript, processing, hasStarted]);

  // Send transcript to chat API + TTS
  const processTranscript = async (input: string) => {
    try {
      setProcessing(true);
      setStatus("מעבד את הבקשה שלך...");
      setUserTranscript("");
      const chatResp = await axios.post(
        `${socketServerUrl}/api/chat`,
        { question: input, context: topic, lessonId },
        {
          headers: { Authorization: `jwt ${user?.accessToken}` },
        }
      );
      const aiText: string = chatResp.data.answer;
      setAiTranscript(aiText);

      setStatus("ממיר טקסט לדיבור...");
      const ttsResp = await axios.post(
        `${socketServerUrl}/api/tts`,
        { text: aiText, lang: "he-IL" },
        { responseType: "arraybuffer" }
      );
      const audioBlob = new Blob([ttsResp.data], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      setStatus("מדבר...");
      setIsSpeaking(true);
      await audio.play();
      audio.onended = () => {
        setIsSpeaking(false);
        setStatus("מקשיב...");
        setListening(true);
        setProcessing(false);
      };
    } catch (err) {
      console.error("Error processing transcript:", err);
      setStatus("שגיאה בעיבוד הטקסט");
      setProcessing(false);
    }
  };

  // Start or resume lesson on server
  const handleStartConversation = async () => {
    if (!user) return;
    try {
      setStatus("מנסה להתחיל...");
      const lesson = await startLesson(
        user,
        topic.subject,
        lessonId || undefined
      );
      setLessonId(lesson._id);
      setHasStarted(true);
      setListening(true);
      setStatus("מקשיב...");
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      if (audioCtx.state === "suspended") await audioCtx.resume();
    } catch (err) {
      console.error("Error starting conversation:", err);
      setStatus("שגיאה בהתחלת השיחה");
    }
  };

  // End lesson on server and navigate home
  const handleEndLesson = async () => {
    if (user && lessonId) {
      try {
       // await endLesson(user, lessonId);
      } catch (err) {
        console.error("Error ending lesson:", err);
      }
    }
    setStatus("השיעור הסתיים");
    audioRef.current?.pause();
    navigate("/home");
  };

  // Reset conversation state
  const resetConversation = () => {
    setUserTranscript("");
    setAiTranscript("");
    setIsSpeaking(false);
    setListening(true);
    setProcessing(false);
    setStatus("מוכן");
  };

  // Initial screen before start
  if (!hasStarted) {
    return (
      <div className="in-session-page">
        <AudioUnlocker />
        <div className="session-container">
          <div className="start-container">
            <div className="start-title">
              ?האם את/ה מוכן/מוכנה להתחיל את השיעור
            </div>
            <button
              onClick={handleStartConversation}
              className="start-button"
            >
              התחל שיחה
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Lesson in progress screen
  return (
    <div className="in-session-page">
      <AudioUnlocker />
      <div className="session-container">
        <div className="chat-area">
          <Avatar3D
            modelSrc={DIRECT_MODEL_URL}
            isSpeaking={isSpeaking}
            speech={aiTranscript || userTranscript}
            fallbackImageSrc="https://via.placeholder.com/300/f0f0f0/333?text=Avatar"
          />
          <Transcript text={aiTranscript || userTranscript} isLoading={processing} />
          {listening && <RealTimeRecorder onTranscript={setUserTranscript} />}
        </div>
        <div className="lesson-buttons-area">
          <LessonButtons
            onActionPerformed={(action) => {
              if (action === "end-lesson") handleEndLesson();
            }}
          />
        </div>
        <div className="status-display">
          <p>סטטוס: {status}</p>
        </div>
        <div className="helper-buttons">
          <button onClick={resetConversation} className="reset-button">
            אתחל שיחה
          </button>
        </div>
        <DrawableMathNotebook
          question={topic.question}
          onRecognize={processTranscript}
        />
      </div>
    </div>
  );
};

export default InSession;
