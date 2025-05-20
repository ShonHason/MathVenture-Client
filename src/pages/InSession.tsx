import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Avatar3D from "../components/Avatar3D";
import Transcript from "../components/Transcript";
import DrawableMathNotebook from "../components/DrawableMathNotebook";
import LessonButtons from "../components/LessonButtons";
import RealTimeRecorder from "../components/RealTimeRecorder";
import AudioUnlocker from "../components/AudioUnlocker";
import { startLesson } from "../services/lessons_api";
import { useUser } from "../context/UserContext";
import "./InSession.css"; // Keep this, we'll modify it
import TopMenuBar from "../features/TopMenuBar";
// import "../components/Transcript.css";
import { useAvatar } from "../context/AvatarContext";
const DIRECT_MODEL_URL =
  "https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb";
const socketServerUrl = process.env.SERVER_API_URL || "http://localhost:4000";

type LocationState = {
  state: {
    topic: { question: string; subject: string };
    lessonId?: string;
  };
};

const InSession: React.FC = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const { topic, lessonId: incomingId } = (useLocation() as LocationState)
    .state;

  const [lessonId, setLessonId] = useState<string>(incomingId || "");
  const [hasStarted, setHasStarted] = useState<boolean>(!!incomingId);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [finalMessege, setFinalMessage] = useState<string>("");
  const [userTranscript, setUserTranscript] = useState<string>("");
  const [aiTranscript, setAiTranscript] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [status, setStatus] = useState<string>(
    'לחץ "התחל שיחה" כדי לפתוח את השיחה'
  );
  const [listening, setListening] = useState<boolean>(false);
  const [mathCount, setMathCount] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [micMuted, setMicMuted] = useState(true);
  const isSpeakingRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const { setAvatarComponent } = useAvatar();
  const [scanning, setScanning] = useState(false);
  const [isKeyboard, setIsKeyboard] = useState(false);
  const [expression, setExpression] = useState("");

  useEffect(() => {
    const avatar = (
      <Avatar3D
        modelSrc={DIRECT_MODEL_URL}
        isSpeaking={isSpeaking}
        speech={aiTranscript || userTranscript}
        fallbackImageSrc="https://via.placeholder.com/300/f0f0f0/333?text=Avatar"
        audioRef={audioRef}
        toggleMute={toggleMute}
        isMuted={isMuted}
        isPaused={isPaused}
        togglePause={togglePause}
        replayAudio={replayAudio}
        speechRate={speechRate}
        setSpeechRate={setSpeechRate}
        micMuted={micMuted}
        toggleMicMute={toggleMicMute}
        listening={listening}
        setListening={setListening}
        status={status}
      />
    );

    setAvatarComponent(avatar);
  }, [
    aiTranscript,
    userTranscript,
    isSpeaking,
    audioRef,
    isMuted,
    isPaused,
    speechRate,
    micMuted,
    listening,
    status,
  ]);

  const toggleMicMute = () => {
    setMicMuted((prev) => !prev);
  };

  useEffect(() => {
    // Start listening only when unmuted AND not currently speaking
    if (!micMuted && !isSpeakingRef.current) {
      setListening(true);
    } else {
      setListening(false);
    }
  }, [micMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speechRate;
    }
  }, [speechRate]);
  const replayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  };
  const onToggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const togglePause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.ended) return;

    if (audio.paused) {
      audio.play();
      setIsPaused(false);
    } else {
      audio.pause();
      setIsPaused(true);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  };
  useEffect(() => {
    if (incomingId) {
      setHasStarted(true);
      setListening(false);
      setStatus("מקשיב...");
    }
  }, [incomingId]);

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
    if (isSpeakingRef.current) {
      console.log("Skipping input because chat is still speaking.");
      return;
    }
    try {
      setProcessing(true);
      setStatus("מעבד את הבקשה שלך...");
      setUserTranscript("");

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Corrected endpoint: removed "/api" prefix
      const chatResp = await axios.post(
        `${socketServerUrl}/lessons/${lessonId}/chat`,
        { question: input },
        { headers: { Authorization: `jwt ${user?.accessToken}` } }
      );

      const {
        answer: aiText,
        mathQuestionsCount,
        done,
        message,
      } = chatResp.data as {
        answer?: string;
        mathQuestionsCount?: number;
        done?: boolean;
        message?: string;
      };

      if (done) {
        setIsFinished(true);
        setFinalMessage(message || "השיעור הסתיים");
        setStatus(message!);
        setTimeout(() => handleEndLesson(), 1200);
        return;
      }

      if (isFinished) {
        return (
          <div className="end-screen container mx-auto p-6 text-center">
            <h1 className="text-4xl font-bold mb-4">🎉 כל הכבוד! 🎉</h1>
            <p className="text-lg mb-6">{finalMessege}</p>
            <p className="mb-6">ענית על כל 15 השאלות בהצלחה.</p>
            <div className="space-x-4">
              <button
                className="px-4 py-2 rounded shadow hover:shadow-lg transition"
                onClick={() => navigate("/home")}
              >
                חזור לדף הבית
              </button>
              <button
                className="px-4 py-2 rounded shadow hover:shadow-lg transition"
                onClick={resetConversation}
              >
                נסה שוב
              </button>
            </div>
          </div>
        );
      }

      setAiTranscript(aiText!);
      if (typeof mathQuestionsCount === "number") {
        setMathCount(mathQuestionsCount);
      }

      setStatus("ממיר טקסט לדיבור...");
      const ttsResp = await axios.post(
        `${socketServerUrl}/api/tts`,
        { text: aiText, lang: "he-IL" },
        { responseType: "arraybuffer" }
      );
      const audioBlob = new Blob([ttsResp.data], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.muted = isMuted;
      audio.playbackRate = speechRate;
      audioRef.current = audio;

      setStatus("מדבר...");
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      await audio.play();
      audio.onended = () => {
        isSpeakingRef.current = false;
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

  const handleStartConversation = async () => {
    if (!user) return;
    try {
      setStatus("מנסה להתחיל...");
      const lesson = await startLesson(
        user,
        topic.subject,
        lessonId || undefined
      );
      // ➡️ אחרי התחלת השיעור – עדכון ה־subjectsList ב־UserContext
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subjectsList: prev.subjectsList?.filter((s) => s !== topic.subject),
        };
      });
      console.log("Updated user in context:", user);
      setLessonId(lesson._id);
      setMathCount(lesson.mathQuestionsCount || 0);
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

  const resetConversation = () => {
    setUserTranscript("");
    setAiTranscript("");
    setIsSpeaking(false);
    setListening(true);
    setProcessing(false);
    setStatus("מוכן");
  };

  if (!hasStarted) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
      {/* <div className="in-session-page"> */}
      <AudioUnlocker />
      <TopMenuBar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        className="top-menu"
        onEndLesson={handleEndLesson}
      />
      <div className="session-container">
        <div className="transcript-wrapper">
          <div className="toggle-menutest-button" onClick={onToggleMenu}>
            <div className={`arrow ${isOpen ? "up" : "down"}`} />
          </div>
          <div className="transcript-main-container">
            <Transcript
              text={aiTranscript || userTranscript}
              isLoading={processing}
            />
          </div>
        </div>

        <div className="avatar-main-container">
          <Avatar3D
            modelSrc={DIRECT_MODEL_URL}
            isSpeaking={isSpeaking}
            speech={aiTranscript || userTranscript}
            fallbackImageSrc="https://via.placeholder.com/300/f0f0f0/333?text=Avatar"
            audioRef={audioRef}
            toggleMute={toggleMute}
            isMuted={isMuted}
            isPaused={isPaused}
            togglePause={togglePause}
            replayAudio={replayAudio}
            speechRate={speechRate}
            setSpeechRate={setSpeechRate}
            micMuted={micMuted}
            toggleMicMute={toggleMicMute}
            listening={listening}
            setListening={setListening}
            status={status}
          />
        </div>

        {topic.subject.toLowerCase() === "math" && (
          <div className="math-progress">שאלות מתמטיקה: {mathCount} / 15</div>
        )}
        {/* </div> */}
        {listening && (
          <RealTimeRecorder
            onTranscript={setUserTranscript}
            micMuted={micMuted}
          />
        )}
        {/* <div className="lesson-buttons-area">
            <LessonButtons
              onActionPerformed={(action) => {
                if (action === "end-lesson") handleEndLesson();
              }}
            />
          </div> */}

        <div className="notebook-main-container">
          <DrawableMathNotebook
            isSpeaking={isSpeaking}
            question={topic.question}
            onRecognize={processTranscript}
          />
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default InSession;
