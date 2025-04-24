import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Avatar3D from "../components/Avatar3D";
import Transcript from "../components/Transcript";
import DrawableMathNotebook from "../components/DrawableMathNotebook";
import LessonButtons from "../components/LessonButtons";
import RealTimeRecorder from "../components/RealTimeRecorder";
import AudioUnlocker from "../components/AudioUnlocker";
import "./InSession.css";
import { startLesson } from "../services/lessons_api";

const DIRECT_MODEL_URL =
  "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb";
const socketServerUrl = process.env.SERVER_API_URL || "http://localhost:4000";

const InSession: React.FC = () => {
  const location = useLocation() as {
    state: { topic: { question: string; subject: any } };
  };
  const { topic } = location.state || {};

  const [userTranscript, setUserTranscript] = useState<string>("");
  const [aiTranscript, setAiTranscript] = useState<string>("");
  const [pauseUntil, setPauseUntil] = useState<number | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>(
    'לחץ "התחל שיחה" כדי לפתוח את השיחה'
  );
  const [listening, setListening] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [lessonId, setLessonId] = useState<string>("");
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);

  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

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

  const processTranscript = async (input: string) => {
    try {
      setProcessing(true);
      setStatus("מעבד את הבקשה שלך...");
      setUserTranscript("");
      const chatResponse = await axios.post(
        `${socketServerUrl}/api/chat`,
        { question: input, context: topic || {}, lessonId },
        {
          headers: {
            Authorization: "jwt " + localStorage.getItem("accessToken"),
          },
        }
      );
      const aiText: string = chatResponse.data.answer;
      setAiTranscript(aiText);

      setStatus("ממיר טקסט לדיבור...");
      const ttsResponse = await axios.post(
        `${socketServerUrl}/api/tts`,
        { text: aiText, lang: "he-IL" },
        { responseType: "arraybuffer" }
      );
      const audioBlob = new Blob([ttsResponse.data], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      setStatus("מדבר...");
      setIsSpeaking(true);
      audio
        .play()
        .then(() => {
          audio.onended = () => {
            setIsSpeaking(false);
            setStatus("מקשיב...");
            setListening(true);
            setProcessing(false);
          };
        })
        .catch((err) => {
          console.error("Audio play failed:", err);
          setProcessing(false);
        });
    } catch (err) {
      console.error("Error processing transcript:", err);
      setStatus("שגיאה בעיבוד הטקסט");
      setProcessing(false);
    }
  };

  const handleStartConversation = async () => {
    try {
      setStatus("מנסה להתחיל...");
      const lesson = await startLesson({
        subject: JSON.stringify(topic.subject),
      });
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

  const resetConversation = () => {
    setUserTranscript("");
    setAiTranscript("");
    setIsSpeaking(false);
    setListening(true);
    setProcessing(false);
    setStatus("מוכן");
  };

  const handleLessonAction = (action: string) => {
    if (action === "pause") {
      setShowPauseModal(true);
      return;
    }

    if (action.startsWith("pause-")) {
      const minutes = parseInt(action.split("-")[1], 10);
      const until = Date.now() + minutes * 60 * 1000;
      setPauseUntil(until);
      setStatus(`הפסקה ל-${minutes} דקות`);
      setListening(false);
      setIsSpeaking(false);
      setProcessing(false);
      return;
    }

    if (action === "explanation") {
      processTranscript("תסביר שוב בבקשה");
    } else if (action === "slow") {
      processTranscript("תסביר לאט יותר בבקשה");
    } else if (action === "end-lesson") {
      setStatus("השיעור הסתיים");
      setListening(false);
      setHasStarted(false);
      navigate("/home");
    }
  };

  useEffect(() => {
    if (!pauseUntil) return;

    const interval = setInterval(() => {
      const remainingMs = pauseUntil - Date.now();

      if (remainingMs <= 0) {
        clearInterval(interval);
        setPauseUntil(null);
        setListening(true);
        setStatus("מקשיב...");
      } else {
        const minutes = Math.floor(remainingMs / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000)
          .toString()
          .padStart(2, "0");
        setStatus(`הפסקה מסתיימת בעוד ${minutes}:${seconds} דקות`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pauseUntil]);

  if (!hasStarted) {
    return (
      <div className="in-session-page">
        <AudioUnlocker />
        <div className="session-container">
          <div className="start-container">
            <div className="start-title">
              ?האם את/ה מוכן/מוכנה להתחיל את השיעור
            </div>
            <button onClick={handleStartConversation} className="start-button">
              התחל שיחה
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <Transcript
            text={aiTranscript || userTranscript}
            isLoading={processing}
          />
          {listening && <RealTimeRecorder onTranscript={setUserTranscript} />}
        </div>
        <div className="lesson-buttons-area">
          <LessonButtons onActionPerformed={handleLessonAction} />
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

      {showPauseModal && (
        <div className="pause-modal-backdrop">
          <div className="pause-modal">
            <h3>בחר משך הפסקה</h3>
            {[1, 3, 5, 10].map((min) => (
              <button
                key={min}
                onClick={() => {
                  setShowPauseModal(false);
                  handleLessonAction(`pause-${min}`);
                }}
              >
                {min} דקות
              </button>
            ))}
            <br />
            <button onClick={() => setShowPauseModal(false)}>בטל</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InSession;
